const mongoClient = require('mongodb').MongoClient;
console.log('----------->>>>>>>>>     >>>>', process.env.MONGODB_URI)
mongoClient.connect(process.env.MONGODB_URI,{ useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB Server');
    }

    const db = client.db('TodoApp')

/*     db.collection('Todos').insertOne({
        text: 'Something very important',
        completed: false
    }, (err, result) => {
        if (err) {
            return console.log("Unable to insert todo", err);
        }
        console.log(JSON.stringify(result.ops));
    }); */

    db.collection('Users').insertOne({
        name: 'Andres Perez',
        age: 12,
        location: 'Fonseca'
    }, (err, result) => {
        if (err) {
            return console.log("Unable to insert user", err);
        }
        console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
    });

    client.close();
})