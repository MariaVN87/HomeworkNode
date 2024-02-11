const express = require('express');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const schema = Joi.object({
    name: Joi.string().min(3).required(),
    lastname: Joi.string().min(2).required(),
    age: Joi.number().min(0).required(),
    city: Joi.string().min(2).required(),
});

const filePath = path.join(__dirname, '/users.json');

app.get('/users', (req, res) => {
    res.send(fs.readFileSync(filePath));
});

app.post('/users', (req, res) => {
    const result = schema.validate(req.body);
    if (result.error) {
        return res.status(404).send({ error: result.error.details });
    }
    const users = JSON.parse(fs.readFileSync(filePath));
    const id = uuidv4();
    users.push({
        id,
        ...req.body,
    });
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    res.send({
        id: id,
    });
});

app.get('/users/:id', (req, res) => {
    const users = JSON.parse(fs.readFileSync(filePath));
    const user = users.find(
        (user) => user.id === +req.params.id)
    if (user) {
        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    }
});

app.put('/users/:id', (req, res) => {
    const result = schema.validate(req.body);
    if (result.error) {
        return res.status(404).send({ error: result.error.details })
    }
    const users = JSON.parse(fs.readFileSync(filePath));
    const user = users.find(
        (user) => user.id === +req.params.id)
    if (user) {
        user.name = req.body.name;
        user.lastname = req.body.lastname;
        user.age = req.body.age;
        user.city = req.body.city;
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    }

});

app.delete('/users/:id', (req, res) => {
    const users = JSON.parse(fs.readFileSync(filePath));
    const user = users.find(
        (user) => user.id === +req.params.id)
    if (user) {
        const userIndex = users.indexOf(user);
        users.splice(userIndex, 1);
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    }

});

app.listen(3000);