require('dotenv').config();
const express = require('express');
const { AzureOpenAI } = require('openai');
const endpoint = process.env.endpoint;
const apiKey = process.env.apiKey;
const apiVersion = process.env.apiVersion;
const deployment = process.env.deployment;
const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
const cors = require('cors');
const app = express();
const db = require('./db');
const session = require('express-session');
app.use(cors());

app.use(express.json());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // For development set false. In production set true and make sure HTTPS is set up. 
}));

app.post('/gpt', async (req, res) => {
    console.log(req.body);
    const prompt = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: req.body.message }];
    const result = await client.chat.completions.create({
        messages: prompt,
        model: ""
    });

    res.send(JSON.stringify(result.choices[0].message.content));
})

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(5000, () => {
    console.log('Example app listening on port 5000!');
});