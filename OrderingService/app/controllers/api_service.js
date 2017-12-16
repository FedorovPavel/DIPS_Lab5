const express   = require('express'),
      router    = express.Router(),
      mongoose  = require('mongoose'),
      orders    = mongoose.model('Order'),
      passport  = require('./../passport/my-passport');

module.exports = function(app) {
  app.use('/orders', router);
};

router.head('/live',function(req, res, next){
  return passport.checkServiceAuthorization(req, res, function(scope){
    return res.status(200).send(null);
  });
});

router.get('/', function(req, res, next){ 
  return passport.checkServiceAuthorization(req, res, function(scope){
    let page  = req.query.page;
    let count = req.query.count;
    const id  = getUserId(req);
    return orders.getOrders(id, page, count, function(err, rOrders){
      if (err) {
        if (err.kind == 'ObjectId')
          return res.status(400).send({status : 'Error', message : 'Invalid ID', service : scope});
        else
          return res.status(400).send({status : 'Error', message : err, service : scope});
      }
      if (rOrders) {
        return orders.getCount(id, function(err, countRecord){
          if (err)
            return res.status(500).send({status : 'Error', message : err, service : scope});
          let data = {
            content : rOrders,
            info : {
              count   : countRecord,
              pages   : Math.ceil(countRecord / count) - 1,
              current : page,
              limit   : count
            },
            service : scope
          };
          return res.status(200).send(data);
        });
      }
      return res.status(404).send({status : 'Error', message : 'Not found orders', service : scope});
    });
  });
});

router.get('/:id', function(req, res, next) {
  return passport.checkServiceAuthorization(req, res, function(scope){
    const uid = getUserId(req);
    const id = req.params.id;
    return orders.getOrder(uid, id, function(err, order){
      if (err) {
        if (err.kind == 'ObjectId')
          return res.status(400).send({status : 'Error', message : 'Bad request : Invalid ID'});
        else 
          return res.status(400).send({status : 'Error', message : err});
      }
      if (order){
        data = {
          content : order,
          service : scope
        };
        return res.status(200).send(data);
      }
      return res.status(404).send({status:'Error', message : "Order isn't found", service : scope});
    });
  });
});

router.put('/confirm/:id', function(req, res, next){
  return passport.checkServiceAuthorization(req, res, function(scope){
    const id = req.params.id;
    const uid = getUserId(req);
    return orders.setWaitStatus(uid, id, function(err, result){
      if (err) {
        if (err.kind == "ObjectId")
          return res.status(400).send({status : 'Error', message : 'Bad request: bad ID', service : scope});
        else 
          return res.status(400).send({status : 'Error', message : err, service : scope});
      } else {
        if (result) {
          const data = {
            content : result,
            service : scope
          };
          return res.status(200).send(data);
        }
        return res.status(404).send({status : 'Error', message : 'Not found order'});
      }
    });
  });
});

router.put('/:id/paid/:bid', function(req, res, next){
  return passport.checkServiceAuthorization(req, res, function(scope){
    const id = req.params.id;
    const bid = req.params.bid;
    const uid = getUserId(req);
    return orders.setPaidStatus(uid, id, bid, function(err, result){
      if (err){
        if (err.kind == "ObjectId")
          return res.status(400).send({status : 'Error', message : 'Bad request:Bad ID', service : scope});
        else
          return res.status(400).send({status : 'Error', message : err, service: scope});
      }
      if (result) {            
        const data = {
          content : result,
          service : scope
        }  
        return res.status(200).send(data);
      }
      return res.status(404).send({status : 'Error', message : 'Order not found', service : scope});
    });
  });
});

router.put('/complete/:id', function(req, res, next){
  return passport.checkServiceAuthorization(req, res, function(scope){
    const id = req.params.id;
    const uid = getUserId(req);
    return orders.setCompleteStatus(uid, id, function(err, result){
      if (err) {
        if (err.kind == "ObjectId")
          return res.status(400).send({status : 'Error', message : 'Bad ID', service : scope});
        else
          return res.status(400).send({status : 'Error', message : err, service : scope});
      }
      if (result) {
        const data = {
          content : result,
          service : scope
        };
        return res.status(202).send(data);
      }
      return res.status(404).send({status : 'Error', message : 'Not found order', service : scope});
    });
  });
});

router.post('/', function(req, res, next){
  return passport.checkServiceAuthorization(req, res, function(scope){
    let item = {
      UserID    : getUserId(req),
      CarID     : req.body.carID,
      StartDate : req.body.startDate,
      EndDate   : req.body.endDate
    };
    return orders.createOrder(item, function(err, result){
      if (err)
        return res.status(400).send({status: 'Error', message : err, service : scope});
      if (result) {
        const data = {
          content : result,
          service : scope
        };
        return res.status(201).send(result);
      }
      return res.status(500).send({status : 'Error', message : "Order don't create", service : scope});
    });
  });
});

function getUserId(req){
  const id = req.headers['userid'];
  return id;
}