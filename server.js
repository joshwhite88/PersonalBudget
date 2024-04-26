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

const validate = function(req, res, next) {

};

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.send('Hello World');
});

app.get('/envelopes', (req, res, next) => {
    res.send(envelopes);
});

app.post('/envelopes', (req, res, next) => {
    let found = envelopes.find(envelope => envelope.title === req.body.title);
    if (!found) {
        let id = envelopes.length + 1;
        envelopes.push({envelopeId: id, budget: req.body.budget, title: req.body.title});
        let envelopeIndex = envelopes.findIndex(envelope => envelope.envelopeId === id);
        res.status(201).send(envelopes[envelopeIndex]);
    } 
    else {
        let errorMessage = new Error('envelope not added');
        errorMessage.status = 400;
        next(errorMessage);
    }
});

app.use((err, req, res, next) => {
    let status = err.status || 400;
    res.status(status).send(err.errorMessage);
});

app.listen(PORT);