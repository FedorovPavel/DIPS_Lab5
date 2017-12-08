// Example model
const crypto    = require('crypto');
const mongoose  = require('mongoose');
const Schema  = mongoose.Schema;

const UserSchema = new Schema({
  login           : {
    type      : String, 
    unique    : true,
    required  : true
  },
  hashedPassword  : {
    type      :String, 
    required  : true
  },
  salt            : {
    type      : String,
    required  : true
  },
  created         : {
    type    : Date, 
    default : Date.now
  }
});

UserSchema.methods.encryptPassword = function(password){
  return crypto.createHmac('sha1', this.salt).update(password).digest("hex");
}

UserSchema.virtual('userId')
  .get(function(){
    return this.id;
  });

UserSchema.virtual('password')
  .set(function(password){
    this.salt           = crypto.randomBytes(32).toString('base64');
    this.hashedPassword = this.encryptPassword(password);
  });

UserSchema.methods.checkPassword = function(password){
  return this.encryptPassword(password) === this.hashedPassword;
}

mongoose.model('User', UserSchema);

var model = mongoose.model('User');

module.exports.userModel = model;