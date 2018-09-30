const mongoClient = require('mongodb').MongoClient;

mongoClient.connect('mongodb://localhost:27017',{ useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB Server');
    }

    console.log('Connected to MongoDB Server ');
    const db = client.db('TodoApp')
    //.find({completed: false})
    db.collection('Todos').find().toArray().then(docs => {
        console.log('Todos');
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        console.log('Unable to fetch todos', err);
    })

    //client.close();
})