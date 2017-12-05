var mongoose  = require('mongoose'),

    Schema    = mongoose.Schema;

var CarSchema = new Schema({
      Manufacturer  : String,
      Model         : String,
      Type          : String,
      Doors         : {type : Number, min: 1, max : 10},
      Person        : {type : Number, min: 1},
      Location      : {
        City    : String,
        Street  : String,
        House   : String
      },
      Cost          : {type : Number, min : 0.0}
});

CarSchema.virtual('date')
  .get(function(){
    return this._id.getTimestamp();
  });

CarSchema.statics.saveNewCar = function(car, callback){
  return car.save(callback);
}

CarSchema.statics.getCars = function(page, count, callback){
  page = Number(page);
  count = Number(count);
  return this.find(function(err, cars){
    if (err)
      return callback(err, null);
    else {
      if (cars){
        let array = [];
        for (let I = 0; I < cars.length; I++){
          array[I] = getCarShortInfo(cars[I]);
        }
        return callback(null, array);
      } else {
        return callback(null, null);
      }
    }
  }).skip(page*count).limit(count);
}

CarSchema.statics.getCar = function(id, callback){
  return this.findById(id, function(err, car) {
    if (err)
      callback(err, null);
    else {
      if (car){
        let result = getCarInfo(car);
        callback(null, result);
      } else {
        callback(null, null);
      }
    }
  });
};

CarSchema.statics.getCount = function(callback){
  return this.count({}, function(err, count){
    if (err)
      return callback(err, null);
    return callback(null, count);
  });
}

// CarSchema.statics.getCars = function(arr, callback){
//   return this.find({'_id' : {$in : arr }}, function (err, cars) {
//     if (err)
//       callback(err, null);
//     else 
//       if (cars){
//         let result = [];
//         for (let I = 0; I < cars.length; I++){
//           result[I] = getCarShortInfo(cars[I]);
//         }
//         callback(null, result);
//       } else {
//         callback(null, null);
//       }
//   });
// }



function getCarInfo(car) {
  let item = {
    'id'            : car._id,
    'Manufacturer'  : car.Manufacturer,
    'Model'         : car.Model,
    'Type'          : car.Type,
    'Doors'         : car.Doors,
    'Person'        : car.Person,
    'Location'      : car.Location,
    'Cost'          : car.Cost
  };
  return item;
}

function getCarShortInfo(car) {
  let item = {
    'id'            : car._id,
    'Manufacturer'  : car.Manufacturer,
    'Model'         : car.Model,
    'Type'          : car.Type,
    'Cost'          : car.Cost
  };
  return item;
}

mongoose.model('Car', CarSchema);