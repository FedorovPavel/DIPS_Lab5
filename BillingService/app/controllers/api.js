const express   = require('express'),
      router    = express.Router();
      mongoose  = require('mongoose');
      billings  = mongoose.model('Billing');

module.exports = function(app) {
  app.use('/billings', router);
};

router.post('/', function(req, res, next) {
  const param = {
    PaySystem : req.body.paySystem,
    Account   : req.body.account,
    Cost      : req.body.cost
  };
  billings.createBillingRecord(param, function(err, billing){
    if (err)
      res.status(400).send({status:'Error', message : err});
    else {
      res.status(201).send(billing);
    }
  });
});

router.get('/:id', function(req, res, next){
  const id = req.params.id;
  billings.getBillingRecord(id, function(err, billing){
    if (err)
      res.status(400).send({status : 'Error' , message : err});
    else {
      if (billing){
        res.status(200).send(billing);
      } else {
        res.status(404).send({status : 'Error', message : 'Billing not found'});
      }
    }
  });
});

router.delete('/:id', function(req, res, next){
  const id = req.params.id;
  billings.revertBilling(id, function(err, result){
    if (err)
      res.status(500).send({status: 'Critical error', message : err});
    else {
      res.send({status: 'Ok', message : 'Billing was removed'});
    }
  });
});