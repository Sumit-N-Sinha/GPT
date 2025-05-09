require('dotenv').config();
const express = require('express');
const { AzureOpenAI } = require('openai');

const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
// const { Sequelize } = require('sequelize');
const endpoint = process.env.endpoint;
const apiKey = process.env.apiKey;
const apiVersion = process.env.apiVersion;
const deployment = process.env.deployment;

const endpoint2 = process.env.endpoint2;
const apiKeynew = process.env.apiKey2;
const apiVersionnew = process.env.apiVersion2;
const deployment2 = process.env.deployment2;
const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
const client2 = new AzureOpenAI({
    endpoint: endpoint2,
    apiKey: apiKeynew,
    apiVersion: apiVersionnew,
    deployment: deployment2
});
const cors = require('cors');
const app = express();
const { createClient } = require('@supabase/supabase-js');
// const db = require('./db');
// const createDBModel = require('./db');
const { BedrockRuntimeClient, ConverseCommand, ConverseStreamCommand, InvokeModelWithResponseStreamCommand } = require('@aws-sdk/client-bedrock-runtime');
const { createAmazonBedrock } = require('@ai-sdk/amazon-bedrock');
const { BedrockClient, GenerateTextCommand } = require("@aws-sdk/client-bedrock");
const region = process.env.region;
const accessKeyId = process.env.accessKeyId;
const secretAccessKey = process.env.secretAccessKey;
const MODEL_ID = "arn:aws:bedrock:eu-west-3:637423631641:inference-profile/eu.anthropic.claude-3-5-sonnet-20240620-v1:0";
const clients = new BedrockRuntimeClient({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
});

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

//db connection
// let sequelize = new Sequelize(postgresql://postgres:sumit@4307@localhost:5432/gpt?schema=public
//     'gpt', 'postgres', 'sumit@4307', {
//     host: 'localhost',
//     dialect: 'postgres',
//     port: 5432
// }
// );

// sequelize
//     .authenticate()
//     .then(() => {
//         console.log("Connection has been established successfully");
//     })
//     .catch((error) => {
//         console.error("Unable to connect to the database:", error);
//     });
// const DBModel = createDBModel(sequelize);
// sequelize
//     .sync({ alter: true })
//     .then(() => {
//         console.log("sync")
//     })
//     .catch((err) => {
//         console.log(err);
//     });

const conversationHistory = [];
app.post('/gpt',  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'message' },
    { name: 'model' }
]),async (req, res) => {
    try {
        console.log('req.files',req.files);
        const { message, model } = req.body;
        let fileContents = '';
        
        // Check if file exists
        if (req.files && req.files.file && req.files.file[0]) {
            const file = req.files.file[0];
            fileContents = fs.readFileSync(file.path, 'utf8');
            // Clean up the uploaded file
            fs.unlinkSync(file.path);
        }
        let response;
        // Add the user's message to the conversation history
        conversationHistory.push({ role: "user", content: message + (fileContents ? '\n\n' + fileContents : '') });
        const prompt = [
            { role: "assistant", content: "You are a professional developer." },
            ...conversationHistory];
        switch (model) {
            case 'amazon':
                console.log("Amazon model selected", prompt);
                const transformedPrompt = prompt.map(msg => ({
                    role: msg.role,
                    content: [{
                        text: msg.content
                    }]
                }));
                console.log("Transformed prompt", transformedPrompt);
                const amazonClient = new ConverseCommand({
                    modelId: MODEL_ID,
                    messages: transformedPrompt,
                    inferenceConfig: { maxTokens: 4096, temperature: 0.5, topP: 0.9 },
                });
                response = await clients.send(amazonClient);
                console.log("Amazon response", response);
                res.send(JSON.stringify(response.output.message.content[0].text));

                // res.send(JSON.stringify(response));
                break;
            case 'azure':
                response = await client.chat.completions.create({
                    messages: prompt,
                    model: "gpt-4o",
                    max_tokens: 2048,
                    temperature: 0.7,
                });
                res.send(JSON.stringify(response.choices[0].message.content));
                break;
            case 'openai':
                response = await client2.chat.completions.create({
                    messages: prompt,
                    model: "gpt-4.1",
                    max_tokens: 32768,
                    temperature: 0.7,
                });
                res.send(JSON.stringify(response.choices[0].message.content));
                break;
            default:
                res.status(400).send('Invalid model specified');
                return;
        }
        // const command = new GenerateTextCommand({
        //     input: { text: prompt }, // Corrected the structure
        //     maxTokens: 2048,
        //     temperature: 0.7,
        //   });
        //   let response;
        //   try {
        //     response = await client.send(command);
        //     // return response;
        //   } catch (error) {
        //     console.error("Error generating text:", error);
        //     throw error;
        //   }
        // const result = await client.chat.completions.create({
        //     messages: prompt,
        //     model: ""
        // });

        // try {
        //     const newRow = await DBModel.create({
        //         prompt: req.body.message,
        //         response: result.choices[0].message.content
        //     });
        //     console.log('New row inserted:');
        // } catch (error) {
        //     console.error('Error inserting new row:', error);
        // }

        // Store the conversation in Supabase
        // const { data, error } = await supabase
        //     .from('conversations')
        //     .insert({
        //         prompt: message,
        //         response: result.choices[0].message.content,
        //         created_at: new Date().toISOString()
        //     });

        // if (error) throw error;

        // res.send(JSON.stringify(result.choices[0].message.content));
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(5000, () => {
    console.log('Example app listening on port 5000!');
});