const mongoose  = require('mongoose');
const Schema  = mongoose.Schema;

const ClientSchema = new Schema({
    name           : {
      type      : String, 
      unique    : true,
      required  : true
    },
    clientId        : {
      type      :String, 
      required  : true,
      required  : true
    },
    clientSecret    : {
      type      : String,
      required  : true
    },
});

mongoose.model('Client', ClientSchema);