const {Todo} = require('../../models/todo');
const {ObjectID} = require('mongodb');
const {User} = require('../../models/user');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
    _id: userOneId,
    email: 'y@gmail.com',
    password: '1234567',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
},{
    _id: userTwoId,
    email: 'yomar@gmail.com',
    password: '1234567',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}]

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneId
},
{
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: userTwoId
}];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
}

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        // return para agregar el .then al chaining and flat the promise
        return Promise.all([userOne, userTwo])
    }).then(() => done());
}

module.exports = {
    populateUsers,
    populateTodos,
    todos,
    users
}