var expect = require('chai').expect;
const request = require('supertest');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');

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

                Todo.findById(res.body._id).then((todo) => {
                    expect(todo.text).to.be.equal(text);
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

                done();
            })
    })
})

describe('GET /todos', () => {
    it('Obtener todos los Items de la lista', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).to.be.greaterThan(1);
            })
            .end(done)
    })
})

describe('GET /todos/:id', () => {
    it('Deberia retornar un item de la lista', (done) => {
        request(app)
            .get('/todos/5bae5431dc4e531f40ac6b15')
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).to.be.equal('Charge my phone')
            })
            .end(done)
    })

    it('Deberia retornar un error 404 si el item no es encontrado', (done) => {
        request(app)
        .get('/todos/5bae505ddbdce61f2c1063eb')
        .expect(404)
        .end(done)
    })

    it('Deberia retornar un error 404 para id no validos', (done) => {
        request(app)
        .get('/todos/5bae505ddbdce61f2c106')
        .expect(404)
        .end(done)
    })


})