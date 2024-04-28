const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;

const envelopes = [];
let budgetAvailable = 4350;
let envelopeCounter = 1;

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.send(`Server started at http://localhost:${PORT}`);
});

app.param('envelopeId', (req, res, next, envelopeId) => {
    if (!isNaN(envelopeId)) {
        let id = Number(envelopeId);
        req.id = id;
        req.index = envelopes.findIndex(envelope => envelope.envelopeId === id);
        next();
    } else {
        let errorMessage = new Error('id must be a number');
        next(errorMessage);
    }
});

const addEnvelope = function(req, res, next) {
    if (!req.body.title || isNaN(req.body.budget)) {
        let errorMessage = new Error('Missing required information');
        return next(errorMessage);
    }
    let title = req.body.title.toLowerCase();
    let exists = envelopes.find(envelope => envelope.title === title);
    if (exists) {
        let errorMessage = new Error(`Budget has already been allocated for ${req.body.title}`);
        return next(errorMessage);
    }
    if (req.body.budget > budgetAvailable || req.body.budget < 0) {
        let errorMessage = new Error('Invalid amount');
        return next(errorMessage);
    }
    budgetAvailable -= req.body.budget;
    envelopes.push(
        {"envelopeId": envelopeCounter++,
         "budget": req.body.budget,
         "title": title
        });
    next();
};

const updateEnvelope = function(req, res, next) {
    let currentTitle = envelopes[req.index].title;
    let currentBudget = envelopes[req.index].budget;
    let adjustedBudget = req.body.budget - currentBudget;
    if (adjustedBudget > budgetAvailable || req.body.budget < 0) {
        let errorMessage = new Error('Invalid amount');
        return next(errorMessage);
    }
    envelopes[req.index].title = req.body.title || currentTitle;
    envelopes[req.index].budget = req.body.budget;
    budgetAvailable -= adjustedBudget;
    next();
};

app.get('/envelopes', (req, res, next) => {
    res.send(envelopes);
});

app.get('/envelopes/:envelopeId', (req, res, next) => {
    if (req.index >= 0) {
        res.send(envelopes[req.index]);
    } else {
        let errorMessage = new Error('envelope not found');
        next(errorMessage);
    }
});

app.post('/envelopes', addEnvelope, (req, res, next) => {
    res.status(201).send(envelopes[envelopes.length - 1]);
});

app.post('/envelopes/transfer/:from/:to', (req, res, next) => {
    let envelopeFrom = envelopes.find(envelope => envelope.title === req.params.from);
    let envelopeTo = envelopes.find(envelope => envelope.title === req.params.to);
    envelopeFrom.budget -= req.body.budget;
    envelopeTo.budget += req.body.budget;
    res.status(201).send([envelopeFrom, envelopeTo]);
});

app.post('/envelopes/distribute', (req, res, next) => {
    let count = envelopes.length;
    let amount = req.body.amount;
    let addition = Math.round(amount / count * 100) / 100;
    budgetAvailable += amount;
    envelopes.forEach(envelope => envelope.budget += addition);
    res.status(200).send(envelopes);
});

app.put('/envelopes/:envelopeId', updateEnvelope, (req, res, next) => {
    res.status(200).send(envelopes[req.index]);
});

app.delete('/envelopes/:title', (req, res, next) => {
    let index = envelopes.findIndex(envelope => envelope.title === req.params.title.toLowerCase());
    if (index >= 0) {
        envelopes.splice(index, 1);
        res.status(200).send(envelopes);
    } else {
        let errorMessage = new Error(`no budget found for ${req.params.title}`);
        next(errorMessage);
    }
})

app.use((err, req, res, next) => {
    let status = err.status || 400;
    res.status(status).send(err.message);
});

app.listen(PORT);