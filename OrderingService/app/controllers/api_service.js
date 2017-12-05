const express   = require('express'),
      router    = express.Router(),
      mongoose  = require('mongoose'),
      orders    = mongoose.model('Order');

module.exports = function(app) {
  app.use('/orders', router);
};

router.head('/live',function(req, res, next){
  res.status(200).send();
});

router.get('/', function(req, res, next){ 
  let page  = req.query.page;
  let count = req.query.count;
  const id = "59f634f54929021fa8251644";
  orders.getOrders(id, page, count, function(err, rOrders){
    if (err) {
      if (err.kind == 'ObjectId')
        res.status(400).send({status : 'Error', message : 'Bad request : Invalid ID'});
      else
        res.status(400).send({status : 'Error', message : err});
    } else {
      if (rOrders) {
        orders.getCount(function(err, countRecord){
          if (err)
            return res.status(500).send({status : 'Error', message : err});
          let data = {
            content : rOrders,
            info : {
              count   : countRecord,
              pages   : Math.ceil(countRecord / count) - 1,
              current : page,
              limit   : count
            }
          }
          res.status(200).send(data);
        });
      } else {
        res.status(404).send({status : 'Error', message : 'Not found orders'});
      }
    }
  });
});

router.get('/:id', function(req, res, next) {
  const uid = "59f634f54929021fa8251644";
  const id = req.params.id;
  orders.getOrder(id, function(err, order){
    if (err) {
      if (err.kind == 'ObjectId')
        res.status(400).send({status : 'Error', message : 'Bad request : Invalid ID'});
      else 
        res.status(400).send({status : 'Error', message : err});
    } else {
      if (order){
        res.status(200).send(order);
      } else {
        res.status(404).send({status:'Error', message : "Order isn't found"});
      }
    }
  });
});

router.put('/confirm/:id', function(req, res, next){
  const id = req.params.id;
  console.log(id);
  orders.setWaitStatus(id, function(err, result){
    console.log(err);
    if (err) {
      if (err.kind == "ObjectId")
        res.status(400).send({status : 'Error', message : 'Bad request: bad ID'});
      else if (err == "Status don't right")
        res.status(400).send({status : 'Error', message : err});
      else 
        res.status(400).send({status : 'Error', message : err});
    } else {
      if (result) {
        res.status(200).send(result);
      } else {
        res.status(404).send({status : 'Error', message : 'Not found order'});
      }
    }
  });
});

router.put('/:id/paid/:bid', function(req, res, next){
  const id = req.params.id;
  const billing_id = req.params.bid;
  orders.setPaidStatus(id, billing_id, function(err, result){
    if (err){
      if (err.kind == "ObjectId")
        res.status(400).send({status : 'Error', message : 'Bad request:Bad ID'});
      else
        res.status(400).send({status : 'Error', message : err});
    } else {
      if (result) {              
        res.status(200).send(result);
      } else {
        res.status(404).send({status : 'Error', message : 'Order not found'});
      }
    }
  });
});

router.put('/complete/:id', function(req, res, next){
  const id = req.params.id;
  orders.setCompleteStatus(id, function(err, result){
    if (err) {
      if (err.kind == "ObjectId")
        res.status(400).send({status : 'Error', message : 'Bad ID'});
      else
        res.status(400).send({status : 'Error', message : err});
    } else {
      if (result) {
        res.status(202).send(result);
      } else {
        res.status(404).send({status : 'Error', message : 'Not found order'});
      }
    }
  });
});

router.post('/', function(req, res, next){
  let item = {
    UserID    : req.body.userID,
    CarID     : req.body.carID,
    StartDate : req.body.startDate,
    EndDate   : req.body.endDate
  };
  orders.createOrder(item, function(err, result){
    if (err)
      return res.status(400).send({status: 'Error', message : err});
    else {
      if (result) {
        res.status(201).send(result);
      } else {
        res.status(500).send({status : 'Error', message : "Order don't create"});
      }
    }
  });
});