const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;

const envelopes = [];

/*
envelope object structure
id: number,
budget: number,
title: string 
*/

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.send('Hello World');
});

app.post('/envelopes', (req, res, next) => {
    console.log(req.body);
    let id = envelopes.length + 1;
    envelopes.push({envelopeId: id, budget: req.body.budget, title: req.body.title});
    if (envelopes.find(envelope => envelope.envelopeId === id)) {
        console.log('envelope added!');
        console.log(envelopes);
        res.status(201).send();
    } else {
        let err = new Error('envelope not added');
        err.status(400);
    }
});


app.listen(PORT);