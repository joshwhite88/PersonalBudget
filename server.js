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

// app.param('envelopeId', (req, res, next, envelopeId) => {
//     if (!isNaN(envelopeId)) {
//         req.id = Number(envelopeId);
//         next();
//     } else {
//         let errorMessage = new Error('id must be a number');
//         next(errorMessage);
//     }
// })

app.get('/envelopes', (req, res, next) => {
    res.send(envelopes);
});

app.get('/envelopes/:envelopeId', (req, res, next) => {
    let id = Number(req.params.envelopeId);
    let foundIndex = envelopes.findIndex(envelope => envelope.envelopeId === id);
    if (foundIndex >= 0) {
        res.send(envelopes[foundIndex]);
    } else {
        let errorMessage = new Error('envelope not found');
        next(errorMessage);
    }
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