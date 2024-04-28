const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;

const envelopes = [];
let budgetAvailable = 4350;
let envelopeCounter = 1;

// const adjustBudget = function(amount) {
//     totalBudget -= amount;
// };

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
    let exists = envelopes.find(envelope => envelope.title === req.body.title);
    if (exists) {
        let errorMessage = new Error(`Budget has already been allocated for ${req.body.title}`);
        return next(errorMessage);
    }
    if (req.body.budget > budgetAvailable || req.body.budget < 0) {
        let errorMessage = new Error('Invalid amount');
        return next(errorMessage);
    }
    budgetAvailable -= req.body.budget;
    next();
};

const updateEnvelope = function(req, res, next) {
    let currentBudget = envelopes[req.index].budget;
    let adjustedBudget = req.body.budget - currentBudget;
    if (adjustedBudget > budgetAvailable || req.body.budget < 0) {
        let errorMessage = new Error('Invalid amount');
        return next(errorMessage);
    }
    envelopes[req.index].budget = req.body.budget;
    budgetAvailable -= adjustedBudget;
    console.log(budgetAvailable);
    next();
    // let currentBudget = envelopes[req.index].budget;
    // console.log(currentBudget);
    // let adjustedBudget = Math.abs(currentBudget - req.body.budget);
    // console.log(adjustedBudget);
    // if (adjustedBudget > budgetAvailable) {
    //     let errorMessage = new Error('Adjusted budget would exceed total budget');
    //     return next(errorMessage);
    // }
    // envelopes[req.index].budget = req.body.budget >= 0 ? req.body.budget : currentBudget;
    // budgetAvailable -= adjustedBudget;
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
    envelopes.push({"envelopeId": envelopeCounter++, "budget": req.body.budget, "title": req.body.title});
    res.status(201).send(envelopes[envelopes.length - 1]);
});

app.put('/envelopes/:envelopeId', updateEnvelope, (req, res, next) => {
    res.status(200).send(envelopes[req.index]);
});

app.use((err, req, res, next) => {
    let status = err.status || 400;
    res.status(status).send(err.message);
});

app.listen(PORT);