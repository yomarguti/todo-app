const expect = require('chai').expect;
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const {todos, populateTodos, populateUsers, users} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
    it('Deberia crear un nuevo item de la lista por hacer', (done) => {
        
        var text = 'Buscar chocolates para el cumpleaños';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect(res => {
                expect(res.body.text).to.be.equal(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then(todos => {
                    expect(todos.length).to.be.equal(1);
                    expect(todos[0].text).to.be.equal(text);
                    done();
                })
                .catch(e => {
                    done(e);
                })

            })
    })

    it('No deberia crear un item cuando se envian datos invalidos', (done) => {

        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then(todos => {
                    expect(todos.length).to.be.equal(2);
                    done();
                })
                .catch(e => {
                    done(e);
                })
            })
    })
})

describe('GET /todos', () => {
    it('Obtener todos los Items de la lista', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).to.be.equal(2);
            })
            .end(done)
    })
})

describe('GET /todos/:id', () => {
    it('Deberia retornar un item de la lista', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).to.be.equal(todos[0].text)
            })
            .end(done)
    })

    it('Deberia retornar un error 404 si el item no es encontrado', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexId}`)
            .expect(404)
            .end(done)
    })

    it('Deberia retornar un error 404 para id no validos', (done) => {
        request(app)
            .get('/todos/123abc')
            .expect(404)
            .end(done)
    })


})

describe('DELETE /todos/:id', () => {
    it('Deberia elminar un item', (done) => {
        var hexId = todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo._id).to.be.equal(hexId)
            })
            .end((err, res) => {
                if (err) {
                    return done(err)
                }

                Todo.findById(hexId).then(todo => {
                    expect(todo).to.be.equal(null)
                    done()
                })
                .catch(e => done(e))
            })
    })

    it('Deberia retornar 404 si el item no es encontrado', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .expect(404)
        .end(done)
        
    })

    it('Deberia retornar 404 si el id del item es invalido', (done) => {
        request(app)
        .delete('/todos/123abc')
        .expect(404)
        .end(done)
    })
})

describe('PATH /todos/:id', () => {
    it('Deberia actualizar una lista', (done) => {

        var hexId = todos[0]._id.toHexString();
        var text = 'This should be the new text';
    
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                completed: true,
                text
            })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).to.be.equal(text);
                expect(res.body.todo.completed).to.be.true;
                expect(res.body.todo.completedAt).to.be.a('number');
            })
            .end(done);
    })

    it('Deberia limpiar completeAt cuando el todo no este completado', (done) => {

        var hexId = todos[1]._id.toHexString();
        var text = 'This should be the new text';
    
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                completed: false,
                text
            })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).to.be.equal(text);
                expect(res.body.todo.completed).to.be.false;
                expect(res.body.todo.completedAt).to.be.equal(null);
            })
            .end(done);
    })
})

describe('GET /users/me', () => {
    it('Deberia retornar un usuario si se autentica', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).to.be.equal(users[0]._id.toHexString());
                expect(res.body.email).to.be.equal(users[0].email);
            })
            .end(done);
    })

    it('Deberia retornar 401 si no se autentica', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).to.be.empty;
            })
            .end(done);
    })
})

describe('POST /users', ()=> {
    it('Deberia crear un usuario', (done) => {
        var email = 'yomar.guti@gmail.com';
        var password = '12345678'
        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).to.exist;
                expect(res.body._id).to.exist;
                expect(res.body.email).to.be.equal(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then( user => {
                    expect(user).to.exist;
                    expect(user.password).not.equal(password);
                    done();
                })
            })
    })

    it('Deberia regresar error de validacion si la peticion es invalida', (done) => {
        request(app)
        .post('/users')
        .send({email: '1234', password: '123'})
        .expect(400)
        .end(done);
    })

    it('No deberia crear usuario si el correo ya esta en uso', (done) => {
        request(app)
        .post('/users')
        .send({email: users[0].email, password: '1234567'})
        .expect(400)
        .end(done); 
    })
})