const express = require('express');
const { AzureOpenAI } = require('openai');
// New GPT-4o
const endpoint = "https://genai-poc-smartx.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2023-03-15-preview";
const apiKey = "282d06d1adf046bc9e65be4ba69cbb60";
const apiVersion = "2023-03-15-preview";
const deployment = "gpt-4o"; //This must match your deployment name.
const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
const cors = require('cors');
const app = express();

app.use(cors());

app.use(express.json());

app.post('/gpt', async(req, res) => {
    console.log(req.body);
    const prompt = [
        {role: "system", content: "You are a helpful assistant."},
        {role: "user", content: req.body.message}];
    const result = await client.chat.completions.create({
        messages: prompt,
        model: ""
      });

      res.send(JSON.stringify(result.choices[0].message.content));

    //   let content = '';
    // let isFirstPart = true;
    // let fullResponse = '';

    // res.write('[')
    // for (const part of result.choices) {
    //   const partContent = part.choices[0]?.delta?.content || '';
    //   if (partContent) {
    //     content = partContent;
    //     let partialResponse = {
    //       message: {
    //         content: content,
    //         role: "assistant"
    //       }
    //     };
    //     if (!isFirstPart) {
    //       res.write(',');
    //     }
    //     res.write(`${JSON.stringify(partialResponse)}\n`);
    //     fullResponse += JSON.stringify(partialResponse);
    //     isFirstPart = false;
    //   }
    // }

    // res.write(']');
    // res.end();
})

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(5000, () => {
    console.log('Example app listening on port 5000!');
});