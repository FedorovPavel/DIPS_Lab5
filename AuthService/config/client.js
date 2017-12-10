var client = require('./../app/models/client').clientModel;

client.remove(function(err){
    if (err)
        return console.log('Error to remove client');
    let aggregator = new client({
        name        : 'aggregator',
        appId       : 'aggregator',
        appSecret   : 'aggregatorKey'
    });
    aggregator.save(function(err, res){
        if (err)
            return console.log('Error to create aggregator-client');
        return console.log('Successfully create clientRecord {'+res.name+'}');
    });
});