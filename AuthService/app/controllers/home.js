const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'),
      passport = require('passport'),
      libs = require('./../../config/passport'),
      oauth2 = require('./../../config/token_controller');

module.exports = (app) => {
  app.use('/', router);
};

router.get('/',passport.authenticate('bearer', {session : false}), function(req, res, next) {
  res.json({
    msg : 'Api is running'
  });  
});

router.post('/token', oauth2.token);

router.get('/info', passport.authenticate('bearer', {session : false}), function(req, res){
  res.json({
    user_id : req.user.userId,
    name : req.user.username,
    scope: req.authInfo.scope
  });
});

router.get('/create', function(req, res, next){
  // let model = mongoose.model('User');
  // let user = new model({
  //   login: 'admin',
  //   password : '1111'
  // });
  // user.save(function(err, nw_user){
  //   if (err)
  //     return res.send(err);
  //   return res.send(nw_user);
  // });
  // let ClientModel = mongoose.model('Client');
  // var client = new ClientModel({ name: "OurService iOS client v1", clientId: "mobileV1", clientSecret:"abc123456" });
  // client.save(function(err, client) {
  //     if(err) return log.error(err);
  //     res.send(null);
  // });
});