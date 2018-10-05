
require('./config');
const _ = require('lodash');
const {mongoose} = require('./mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

//Server for routes

var port = process.env.PORT


var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
       text: req.body.text 
    });

    todo.save().then(doc => {
        res.send(doc)
    }, e => {
        res.status(400).send(e);
    })
})

app.get('/todos', (req, res) => {
    Todo.find().then(todos => {
        res.send({todos});
    }, e => {
        res.status(400).send(e);
    })
})

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({})
    }

    Todo.findById(id).then(todo => {
        if (!todo) {
            return res.status(404).send({})
        }

        return res.send({todo})
    })
    .catch(e => {
        return res.status(404).send({})
    })
})

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({})
    }

    Todo.findByIdAndDelete(id).then(todo => {
        
        if (!todo) {
            return res.status(404).send({})
        }

        return res.status(200).send({todo})

    }).catch(e => {
        return res.status(404).send({})
    });
})

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;

    var body = _.pick(req.body, ['text', 'completed'])

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({})
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body},{new: true}).then(todo => {
        if (!todo) {
            return res.status(404).send({});
        }

        res.status(200).send({todo});
    })
    .catch(e => {
        res.status(400).send({});
    })


})

//users

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password'])

    var user = new User(body);

    user.save().then(user => {
        res.send({user})
    }, e => {
        res.status(400).send(e);
    })


})

app.listen(port, () => {
    console.log('Started on port ', port);
})

module.exports = {
    app
}