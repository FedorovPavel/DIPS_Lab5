var express   = require('express'),
    router    = express.Router(),
    mongoose  = require('mongoose'),
    catalog   = mongoose.model('Car');

module.exports = function (app) {
  app.use('/catalog', router);
};

//  get cars
router.get('/',function(req, res, next){
  let page  = Number(req.query.page);
  let count = Number(req.query.count); 
  catalog.getCars(page, count, function(err ,result){
    if (err)
      res.status(400).send({status : 'Error', message : err});
    else {
      catalog.getCount(function(err, count_record){
        if (err){
          res.status(500).send({status : 'Error', message : 'undefined count elem'});
        }
        data = {
          content : result,
          info : {
            count   : count_record,
            pages   : Math.ceil(count_record / count) - 1,
            current : page,
            limit   : count
          }
        }
        res.status(200).send(data);
      });
    }
  });
});

// get car
router.get('/:id', function(req, res, next){
  const id = req.params.id;
  catalog.getCar(id, function(err, result){
    if (err) {
      if (err.kind == "ObjectID")
        res.status(400).send({status:'Error', message : 'Bad request: Invalid ID'});
      else 
        res.status(404).send({status:'Error', message : 'Car not found'});
    } else {
      res.status(200).send(result);
    }
  });
});

// router.get('/ids', function(req, res, next){
//   let ids = String(req.params.ids);
//   ids.replace('-',',');
//   const arr = Array.from(ids);
//   catalog.getCars(arr, function(err ,result){
//     if (err){
//       res.status(400).send({status:'Error', message : err});
//     } else {
//       res.status(200).send(result);
//     }
//   });
// });

router.head('/live',function(req, res, next){
  res.status(200).send(null);
});

/*
router.get('/generate_random_cars', function (req, res, next) {
  const count = req.query.count ? req.query.count : 100;
    for (let I = 0; I < count; I++){
      let car = new catalog({
        Manufacturer  : 'Generate random car ' + I.toString(),
        Model         : 'Model ' + I.toString(),
        Type          : "Type" + (I%5).toString(),
        Doors         : (I % 9)+1,
        Person        : 1+I,
        Loactaion     : {
          City    : 'Moscow',
          Street  : I.toString() +'Советский переулок',
          House   : (100 - I)
        },
        Cost          : (I + 0.1)
      });
      catalog.saveNewCar(car, function(err, result){
        if (err)
          return next(err);
        else 
          console.log("Save new car " + I);
      });
    }
  res.status(200).send('Random ' + count + 'car');
});*/