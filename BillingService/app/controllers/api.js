const express   = require('express'),
      router    = express.Router(),
      mongoose  = require('mongoose'),
      billings  = mongoose.model('Billing'),
      passport  = require('./../passport/my-passport');

module.exports = function(app) {
  app.use('/billings', router);
};

router.post('/', function(req, res, next) {
  return passport.checkServiceAuthorization(req, res, function(scope){
    const param = {
      PaySystem : req.body.paySystem,
      Account   : req.body.account,
      Cost      : req.body.cost
    };
    return billings.createBillingRecord(param, function(err, billing){
      if (err)
        return res.status(400).send({status:'Error', message : err, service : scope});
      const data = {
        content : billing,
        service : scope
      };
      return res.status(201).send(data);
    });
  });
});

router.get('/scope', function(req, res, next){
  return passport.checkServiceAuthorization(req, res, function(scope){
    const ids = String(req.query.ids).split(',');
    return billings.getBillingsRecordByIDs(ids, function(err, billings){
      if (err)
        return res.status(400).send({status : 'Error', message : err, service : scope});
      if (billings){
        const data = {
          content : billings,
          service : scope
        };
        return res.status(200).send(data);
      }
      return res.status(404).send({status : 'Error', message : "billings not found", service : scope});
    });
  });
}); 

router.get('/:id', function(req, res, next){
  return passport.checkServiceAuthorization(req, res, function(scope){
    const id = req.params.id;
    return billings.getBillingRecord(id, function(err, billing){
      if (err)
        return res.status(400).send({status : 'Error' , message : err, service : scope});
      else {
        if (billing){
          const data = {
            content : billing,
            service : scope
          };
          return res.status(200).send(data);
        } 
        return res.status(404).send({status : 'Error', message : 'Billing not found', service : scope});
      }
    });
  });  
});

router.delete('/:id', function(req, res, next){
  return passport.checkServiceAuthorization(req, res, function(scope){
    const id = req.params.id;
    return billings.revertBilling(id, function(err, result){
      if (err)
        return res.status(500).send({status: 'Critical error', message : err, service : scope});
      return res.send({status: 'Ok', message : 'Billing was removed', service : scope});
    });
  });
});

