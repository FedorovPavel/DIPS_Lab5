const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'),
      passport = require('passport'),
      libs = require('./../../config/passport-stategy'),
      oauth2 = require('./../../config/oauth-event-handles');

module.exports = (app) => {
  app.use('/auth', router);
};

router.post('/token', oauth2.token);

router.post('/userId', passport.authenticate(['basic', 'bearer'], {session : false}), function(req, res, next){
  res.status(200).send(req.user.userId);
});

// router.get('/create', function(req, res, next){
//   let model = mongoose.model('User');
//   let user = new model({
//     login: 'moderator',
//     password : '4444'
//   });
//   user.save(function(err, nw_user){
//     if (err)
//       return res.send(err);
//     return res.send(nw_user);
//   });
// let ClientModel = mongoose.model('Client');
// var client = new ClientModel({ name: "OurService iOS client v1", clientId: "mobileV1", clientSecret:"abc123456" });
// client.save(function(err, client) {
//     if(err) return log.error(err);
//     res.send(null);
// });
//});

function getToken(text){
  text = String(text);
  const token = text.slice(7);
  return token;
}