const mongoose  = require('mongoose');
const Schema  = mongoose.Schema;

var AccessToken = new Schema({
    appId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('AccessToken', AccessToken);

var model = mongoose.model('AccessToken');

module.exports.token = model;