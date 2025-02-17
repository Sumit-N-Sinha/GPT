require('dotenv').config();
const express = require('express');
const { AzureOpenAI } = require('openai');
const { Sequelize } = require('sequelize');
const endpoint = process.env.endpoint;
const apiKey = process.env.apiKey;
const apiVersion = process.env.apiVersion;
const deployment = process.env.deployment;
const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
const cors = require('cors');
const app = express();
const db = require('./db');
const createDBModel = require('./db');
const { createAmazonBedrock } = require('@ai-sdk/amazon-bedrock');
const { BedrockClient, GenerateTextCommand } = require("@aws-sdk/client-bedrock");
const region = process.env.region;
const accessKeyId = process.env.accessKeyId;
const secretAccessKey = process.env.secretAccessKey;
const clients = new BedrockClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
app.use(cors());

app.use(express.json());

//db connection
let sequelize = new Sequelize('gpt', 'postgres', 'sumit@4307', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432
});

sequelize
    .authenticate()
    .then(() => {
        console.log("Connection has been established successfully");
    })
    .catch((error) => {
        console.error("Unable to connect to the database:", error);
    });
const DBModel = createDBModel(sequelize);
sequelize
    .sync({ alter: true })
    .then(() => {
        console.log("sync")
    })
    .catch((err) => {
        console.log(err);
    });

const conversationHistory = [];
app.post('/gpt', async (req, res) => {
    console.log(req.body);

     // Add the user's message to the conversation history
     conversationHistory.push({ role: "user", content: req.body.message });
    const prompt = [
        { role: "system", content: "You are a professional developer." },
        ...conversationHistory];
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
    const result = await client.chat.completions.create({
        messages: prompt,
        model: ""
    });

    try {
        const newRow = await DBModel.create({
            prompt: req.body.message,
            response: result.choices[0].message.content
        });
        console.log('New row inserted:');
    } catch (error) {
        console.error('Error inserting new row:', error);
    }

    res.send(JSON.stringify(result.choices[0].message.content));
})

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(5000, () => {
    console.log('Example app listening on port 5000!');
});