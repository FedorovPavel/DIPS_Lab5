var express   = require('express'),
    router    = express.Router(),
    bus       = require('./../coordinator/bus'),
    validator = require('./../validator/validator'),
    amqp      = require('amqplib/callback_api'),
    render    = require('./render'),
    auth      = require('basic-auth'),
    interval  = 20000;// 20s to repeate check live
    

module.exports = function (app) {
  app.use('/aggregator', router);
};

function addIdOrderToQueue(id) {
  amqp.connect('amqp://localhost', function(err, conn){
    conn.createChannel(function(err, ch){
      var queue = 'orders_id';
      
      ch.assertQueue(queue, {durable : false});
      ch.sendToQueue(queue, Buffer.from(id),{persistent : true});
      console.log('Order ID : ' + id + ' push to queue [' + queue + ']');
    });
    setTimeout(function() {conn.close()},500);
  });
}

function receiveIdOrderFromQueue(callback){
  amqp.connect('amqp://localhost', function(err, conn){
    conn.createChannel(function(err, ch){
      var queue = 'orders_id';

      ch.assertQueue(queue, {durable : false});
      ch.consume(queue, function(id){
        const _id = id.content.toString('utf-8');
        console.log('pop order id: ' + _id + ' from queue ['+queue+']');
        callback(_id);
      }, {noAck : true});
      setTimeout(function(){
        conn.close();
        callback(null);
      },500);
    });
  });
}

setInterval(function(){
  bus.checkOrderService(function(err, status){
    if (status == 200){
      receiveIdOrderFromQueue(function(id){
        if (id){
          bus.orderComplete(id, function(err, status, response){
            if (err)
              addIdOrderToQueue(id);
            else {
              if (status == 200){
                console.log('order with id ['+ id + '] is processed');
              } else if (status == 500) {
                addIdOrderToQueue(id);
              } else {
                console.log('request to complete order with [' + id + '] return status : ' + status + ' response: ');
                console.log(response);
              }
            }
          });
        }
      });
    }
  });
}, interval);

//  Auth
router.post('/auth', function(req, res, next){
  let user;
  if (req.headers.authorization.indexOf('Basic') === 0){
    user = auth(req);
    const info = {
      login : user.name,
      password : user.pass
    };
    return bus.getTokenByPwd(info, function(err, status, responseText){
      if (err)
        res.status(status).send(responseText);
      else {
        res.status(status).send(responseText);
      }
    });
  } else if (req.headers.authorization.indexOf('Bearer') === 0) {
    const info = {
      ref_token : getBearerToken(req)
    };
    return bus.getTokenByToken(info, function(err, status, responseText){
      if (err)
        res.status(status).send(responseText);
      else {
        res.status(status).send(responseText);
      }
    });
  }
});

// Get any cars
router.get('/catalog', function(req, res, next){
  let page  = validator.checkPageNumber(req.query.page);
  let count = validator.checkCountNumber(req.query.count);
  const dataContainer = {
    page : page,
    count : count
  };
  bus.getCars(dataContainer, function(err, statusCode = 500, responseText){
    if (err)
      res.status(statusCode).send(responseText);
    else {
      res.status(statusCode).send(responseText);
    }
  });
});

//  Get car by ID
router.get('/catalog/:id', function(req, res, next){
  const id = validator.checkID(req.params.id);
  if (typeof(id) == 'undefined'){
    res.status(400).send({status : 'Error', message : 'Bad request: ID is undefined'});
  } else {
    const data = {
      id : id
    };
    return bus.getCar(data, function(err, statusCode, responseText){
      if (err)
        res.status(statusCode).send(responseText);
      else 
        res.status(statusCode).send(responseText);
    });
  }
});

//  Create Order
router.post('/orders/', function(req, res, next){
  const token = getBearerToken(req);
  return getUserId(token, function(err, status, id){
    if (err)
      return res.status(status).send(err);
    if (status != 200){
      return res.status(status).send('Something went wrong');
    }
    id = id.id;
    const param = {};
    param.userId = id;
    const carID = validator.checkID(req.body.carID);
    if (typeof(carID) == 'undefined'){
      res.status(400).send({status : 'Error', message : 'Bad request : Invalid car ID'});
      return;
    }
    param.carID = carID;
    const startDate = validator.ConvertStringToDate(req.body.startDate);
    if (!startDate){
      res.status(400).send({status : 'Error', message : 'Bad request : Invalid start rent date'});
      return;
    }
    param.startDate = startDate;
    const endDate = validator.ConvertStringToDate(req.body.endDate);
    if (!endDate) {
      res.status(400).send({status : 'Error', message : 'Bad request : Invalid end rent date'});
      return;
    }
    param.endDate = endDate;
    return bus.createOrder(param, function(err, status, response){
      return res.status(status).send(response);
    });
  });
});

//  Get order
router.get('/orders/:order_id', function(req, res, next){
  const token = getBearerToken(req);
  return getUserId(token, function(err, status, id){
    if (err)
      return res.status(status).send(err);
    if (status != 200){
      return res.status(status).send('Something went wrong');
    }
    id = id.id;
    const data = {
      userId : id
    };
    const order_id = validator.checkID(req.params.order_id);
    if (typeof(order_id) == 'undefined') {
      res.status(400).send({status : 'Error', message : 'Bad request: Invalid ID'});
      return;
    }
    data.order_id = order_id;
    return bus.getOrder(data, function(err, status, response){
      return res.status(status).send(response);
    });
  });
});

//  Get orders(new version)
/* router.get('/orders', function(req, res, next){
  let page  = validator.checkPageNumber(req.query.page);
  let count = validator.checkCountNumber(req.query.count);
  bus.getOrders(page, count, function(err, status, orders){
    if (err)
      res.status(status).send(orders);
    else {
      let carId = [];
      let billingId = [];
      for (let I = 0; I < orders.length; I++){
        if (carId.indexOf(orders[I].CarID) == -1)
          carId.push(orders[I].CarID);
        if (typeof(orders[I].BillingID) != 'undefined')
          billingId.push(orders[I].BillingID);
      }
      bus.getCarsByIDs(carId,function(err, status, cars){
        if (err){
          for (let I = 0; I < orders.length; I++)
            orders[I].CarID = "Неизвестно";
        } else {
          cars = Array.from(cars);
          for (let I = 0; I < orders.length; I++){
            const car = orders[I].CarID;
            delete orders[I].CarID;
            const index = cars.findIndex(function(elem, index, arr){
              if (elem.id == car)
                return index;
              return false;
            });
            orders[I].Car = cars[index];
          }
        }
        busGetBillingsIDs(billingId, function(err, status, billings){
          if (err) {
            for (let I = 0; I < orders.length; I++){
              orders[I].BillingID = 'Неизвестно';
            }
          } else {
            billings = Array.from(billings);
            for (let I = 0; I < orders.length; I++) {
              const billing = orders[I].BillingID;
              delete orders[I].BillingID;
              if (typeof(billing) != 'undefined'){
                const index = billings.findIndex(function(elem, index, arr){
                  if (elem.id == billing)
                    return index;
                  return false;
                });
                orders[I].Billing = billings[index];
              }
            }
          }
          res.status(200).send(orders);
        });
      });
    }
  });
});*/

//  Get orders(last version)
router.get('/orders', function(req, res, next){
  const token = getBearerToken(req);
  return getUserId(token, function(err, status, id){
    if (err)
      return res.status(status).send(err);
    if (status != 200){
      return res.status(status).send('Something went wrong');
    }
    id = id.id;
    let page  = validator.checkPageNumber(req.query.page);
    let count = validator.checkCountNumber(req.query.count);
    const data = {
      page : page,
      count : count,
      userId : id
    };
    return bus.getOrders(data, function(err, status, orders){
      if (err)
        return res.status(status).send(orders);
      else {
        let _counter_to_ready_order = 0;
        if (orders && orders.content.length > 0){
          for (let I = 0; I < orders.content.length; I++){
            const car_id = orders.content[I].CarID;
            if (typeof(car_id) != 'undefined'){
              const carData = {
                id : car_id
              }
              return bus.getCar(carData, function(err, status, car){
                delete orders.content[I].CarID;
                if (err){
                  orders.content[I].Car = 'Неизвестно';
                } else {
                  if (car && status == 200){
                    orders.content[I].Car = car;
                  } else {
                    orders.content[I].Car = 'Неизвестно';
                  }
                }
                if (typeof(orders.content[I].BillingID) != 'undefined'){
                  const billing_id = orders.content[I].BillingID;
                  const billingData = {
                    billing_id : billing_id,
                    userId : id
                  };
                  return bus.getBilling(billingData, function(err, status, billing){
                    delete orders.content[I].BillingID;
                    if (err){
                      orders.content[I].Billing = 'Неизвестно';
                    } else {
                      if (billing && status == 200){
                        orders.content[I].Billing = billing;
                      } else {
                        orders.content[I].Billing = 'Неизвестно';
                      }
                    }
                    _counter_to_ready_order++;
                    if (_counter_to_ready_order == orders.content.length){
                      res.status(200).send(orders);
                    }
                  });
                } else {
                  _counter_to_ready_order++;
                  if (_counter_to_ready_order == orders.content.length){
                    res.status(200).send(orders);
                  }
                }
              });
            }else {
              orders.content[I].Car='Неизвестно';
            }
          }
        } else {
          res.status(status).send(null);
        }
      }
    });
  });
});

//  Confirm order
router.put('/orders/confirm/:id', function(req, res, next){
  const token = getBearerToken(req);
  return getUserId(token, function(err, status, id){
    if (err)
      return res.status(status).send(err);
    if (status != 200){
      return res.status(status).send('Something went wrong');
    }
    id = id.id;
    const oid = req.params.id;
    const data = {
      order_id : oid,
      userId : id
    }
    return bus.orderConfirm(data, function(err, status, response){
      return res.status(status).send(response);
    });
  });
});

router.put('/orders/paid/:id', function(req, res, next){
  const token = getBearerToken(req);
  return getUserId(token, function(err, status, id){
    if (err)
      return res.status(status).send(err);
    if (status != 200){
      return res.status(status).send('Something went wrong');
    }
    id = id.id;
    const oid = req.params.id;
    let data = {};
    const paySystem = validator.checkPaySystem(req.body.paySystem);
    if (typeof(paySystem) == 'undefined') {
      res.status(400).send({status : 'Error', message : 'Bad request : PaySystem is undefined'});
      return;
    }
    if (!paySystem){
      res.status(400).send({status : 'Error', message : 'Bad request : Invalid PaySystem'});
      return;
    }
    data.paySystem = paySystem;
    const account = validator.checkAccount(req.body.account);
    if (typeof(account)  == 'undefined') {
      res.status(400).send({status : 'Error', message : 'Bad request : Account is undefined'});
      return;
    }
    if (!account){
      res.status(400).send({status : 'Error', message : 'Bad request : Invalid Account'});
      return;
    }
    data.account = account;
    const cost  = validator.checkCost(req.body.cost);
    if (typeof(cost) == 'undefined'){
      res.status(400).send({status : 'Error', message : 'Bad request : Cost is undefined'});
      return;
    }
    if (!cost){
      res.status(400).send({status : 'Error', message : 'Bad request : Invalid cost'});
      return;
    }
    data.cost = cost;
    const checkData = {
      orderId : oid,
      userId : id
    };
    return bus.getOrder(checkData, function(err, status, pre_order){
      if (err)
        return res.status(status).send(pre_order);
      else {
        if (pre_order && pre_order.Status == 'WaitForBilling'){
          let transferData = {
            orderId: oid,
            userId : id,
            data : data
          };
          return bus.createBilling(transferData, function(err, status, response){
            if (err)
              return res.status(status).send(response);
            else {
              if (response){
                const billing_id = response.id;
                transferData = {
                  order_id : oid,
                  userId : id,
                };
                return bus.orderPaid(transferData, function(err, status, order){
                  if (err){
                    transferData = {
                      userId : id,
                      billing_id : billing_id
                    };
                    return bus.revertBilling(transferData, function(err, status, revMsg){
                      console.log('Request to revert billing with id: ' + billing_id + ' completed with status :' + status + ' and response : ' + revMsg.message);
                    });
                    let msg = (order) ? order : 'Sorry. Service is not available.';
                    msg += ' We return your money.';
                    res.status(500).send(msg);
                  } else {
                    if (status == 200 && order){
                      return res.status(200).send({order: order, billing : response });
                    } else {
                      transferData = {
                        userId : id,
                        billing_id : billing_id
                      };
                      return bus.revertBilling(transferData, function(err, status, revMsg){
                        let msg = (order) ? order : 'Sorry. Service is not available.';
                        msg +=  'We return your money.';
                        res.status(status).send(msg);
                      });
                    }
                  }
                });
              }
            }
          });
        } else {
          res.status(400).send({status : 'Error', message : "Status don't right"});
        }
      }
    });
  });
});

router.put('/orders/complete/:id', function(req, res, next){
  const token = getBearerToken(req);
  return getUserId(token, function(err, status, id){
    if (err)
      return res.status(status).send(err);
    if (status != 200){
      return res.status(status).send('Something went wrong');
    }
    id = id.id;
    const oid = req.params.id;
    const data = {
      orderId : oid,
      userId, id
    };
    return bus.orderComplete(data, function(err, status, response){
      if (err){
        if (status == 503) {
          addIdOrderToQueue(data);
          res.status(202).send({status : 'Ok', message : 'Change order status succesfully'});
        }else {
          res.status(status).send(response);
        }
      } else {
        res.status(status).send(response);
      }
    });
  });
});

/*
router.post('/billings', function(req, res, next){
  let data = {};
  const paySystem = validator.checkPaySystem(req.body.paySystem);
  if (typeof(paySystem) == 'undefined') {
    res.status(400).send({status : 'Error', message : 'Bad request : PaySystem is undefined'});
    return;
  }
  if (!paySystem){
    res.status(400).send({status : 'Error', message : 'Bad request : Invalid PaySystem'});
    return;
  }
  data.paySystem = paySystem;
  const account = validator.checkAccount(req.body.account);
  if (typeof(account)  == 'undefined') {
    res.status(400).send({status : 'Error', message : 'Bad request : Account is undefined'});
    return;
  }
  if (!account){
    res.status(400).send({status : 'Error', message : 'Bad request : Invalid Account'});
    return;
  }
  data.account = account;
  const cost  = validator.checkCost(req.body.cost);
  console.log(cost);
  if (typeof(cost) == 'undefined'){
    res.status(400).send({status : 'Error', message : 'Bad request : Cost is undefined'});
    return;
  }
  if (!cost){
    res.status(400).send({status : 'Error', message : 'Bad request : Invalid cost'});
    return;
  }
  data.cost = cost;
  bus.createBilling(data, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});
*/

router.get('/billings/:id', function(req, res, next){
  const token = getBearerToken(req);
  return getUserId(token, function(err, status, id){
    if (err)
      return res.status(status).send(err);
    if (status != 200){
      return res.status(status).send('Something went wrong');
    }
    id = id.id;
    const bid = validator.checkID(req.params.id);
    if (typeof(bid) == 'undefined'){
      return res.status(400).send({status : 'Error', message : 'Bad request : id is not valid'});
    }
    const data = {
      userId : id,
      billingId: bid
    }
    return bus.getBilling(data, function(err, status, response){
      return res.status(status).send(response);
    });
  });
});

function getUserId(token, callback){
  const data = {
    token: token
  };
  return bus.getUserId(data, callback);
}

function getBearerToken(req){
  return req.headers.authorization.split(' ')[1];
}