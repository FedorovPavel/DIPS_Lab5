const mongoose  = require('mongoose');
const Schema  = mongoose.Schema;

var RefreshToken = new Schema({
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
});

mongoose.model('RefreshToken', RefreshToken);

var model = mongoose.model('RefreshToken');

module.exports.tokenModel = model;