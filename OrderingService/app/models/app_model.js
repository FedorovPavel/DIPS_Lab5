const mongoose  = require('mongoose');
const Schema  = mongoose.Schema;

const ApplicationSchema = new Schema({
    name           : {
      type      : String, 
      unique    : true,
      required  : true
    },
    appId        : {
      type      :String, 
      required  : true
    },
    appSecret    : {
      type      : String,
      required  : true
    }
});

mongoose.model('App', ApplicationSchema);

var model = mongoose.model('App');

// init 

function init(){
  return model.findOne({name : 'aggregator'}, function(err, app){
    if (err)
      console.log('Problem with MongoDB');
    if (!app){
      let agg = new model({
        name : 'aggregator',
        appId : 'aggregator',
        appSecret : 'aggregatorKey'
      });
      return agg.save(function(err, agg){
        if (err)
          console.log('Aggregator not saved');
        console.log('Create record for aggregator');
        return;
      });
    }
    console.log('Aggregator in DB');
    return;
  });
}

init();

module.exports.model = model;