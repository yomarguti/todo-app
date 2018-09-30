var mongoose = require('mongoose');

var User = mongoose.model('User', {
    email: {
        type: String,
        trim: true,
        minLength: 1,
        required: true
    }
})

module.exports = {
    User
}