const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;

const envelopes = [];
let totalBudget = 4350;
let envelopeCounter = 1;

// const adjustBudget = function(amount) {
//     totalBudget -= amount;
// };

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.send('Hello World');
});

app.param('envelopeId', (req, res, next, envelopeId) => {
    if (!isNaN(envelopeId)) {
        req.id = Number(envelopeId);
        next();
    } else {
        let errorMessage = new Error('id must be a number');
        next(errorMessage);
    }
})

app.get('/envelopes', (req, res, next) => {
    res.send(envelopes);
});

app.get('/envelopes/:envelopeId', (req, res, next) => {
    let foundIndex = envelopes.findIndex(envelope => envelope.envelopeId === req.id);
    if (foundIndex >= 0) {
        res.send(envelopes[foundIndex]);
    } else {
        let errorMessage = new Error('envelope not found');
        next(errorMessage);
    }
});

app.post('/envelopes', (req, res, next) => {
    let budget = req.body.budget;
    let title = req.body.title;
    let exists = envelopes.find(envelope => envelope.title === title);
    if (!exists) {
        envelopes.push({"envelopeId": envelopeCounter, "budget": budget, "title": title});
        envelopeCounter++;
        totalBudget -= budget;
        let envelopeIndex = envelopes.findIndex(envelope => envelope.title === title);
        res.status(201).send(envelopes[envelopeIndex]);
    } 
    else {
        let errorMessage = new Error('envelope not added');
        errorMessage.status = 400;
        next(errorMessage);
    }
});

app.put('/envelopes/:envelopeId', (req, res, next) => {
    let foundIndex = envelopes.findIndex(envelope => envelope.envelopeId === req.id);
    envelopes[foundIndex].budget = req.body.budget;
    res.status(200).send(envelopes[foundIndex]);
});

app.use((err, req, res, next) => {
    let status = err.status || 400;
    res.status(status).send(err.errorMessage);
});

app.listen(PORT);