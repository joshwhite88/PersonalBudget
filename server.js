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

const addEnvelope = function(req, res, next) {
    let budget = req.body.budget;
    let title = req.body.title;
    let exists = envelopes.find(envelope => envelope.title === title);
    if (exists) {
        let errorMessage = new Error(`Budget has already been allocated for ${title}`);
        return next(errorMessage);
    }
    if (budget > budgetAvailable) {
        let errorMessage = new Error('Amount exceeds total budget');
        return next(errorMessage);
    }
    req.budget = budget;
    budgetAvailable -= budget;
    console.log(budgetAvailable);
    req.title = title;
    next();
};

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
})

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
    envelopes.push({"envelopeId": envelopeCounter, "budget": req.budget, "title": req.title});
    envelopeCounter++;
    res.status(201).send(envelopes[envelopes.length - 1]);
});

app.put('/envelopes/:envelopeId', (req, res, next) => {
    envelopes[req.index].budget = req.body.budget;
    res.status(200).send(envelopes[req.index]);
});

app.use((err, req, res, next) => {
    let status = err.status || 400;
    res.status(status).send(err.message);
});

app.listen(PORT);