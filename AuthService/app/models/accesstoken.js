const mongoose  = require('mongoose');
const Schema  = mongoose.Schema;

var AccessToken = new Schema({
    userId: {
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
    },
    lastUse : {
        type: Date,
        default : Date.now
    }
});

mongoose.model('AccessToken', AccessToken);

var model = mongoose.model('AccessToken');

module.exports.tokenModel = model;