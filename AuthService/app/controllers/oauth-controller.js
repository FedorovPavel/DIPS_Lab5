const express   = require('express'),
      router    = express.Router(),
      passport  = require('./../logic/my-passport');

module.exports = (app) => {
  app.use('/auth', router);
};

router.post('/token', function(req, res, next){
  //  считываем заголовок из header
  const header_auth = req.headers['authorization'];
  //  если такой заголовк есть и он не пуст
  if (header_auth && typeof(header_auth) !== 'undefined'){
    //  Проверим авторизацию сервиса aggregator
    return passport.checkServiceAuthorization(header_auth, function(err, scope){
      //  Если ошибка вернуть ошибку для сервиса
      if (err)
        return res.status(500).send(getResponseObject('Service error', err));
      //  Если данные для aggregator не определены вернуть ошибку
      if (!scope)
        return res.status(500).send(getResponseObject('Service error', 'Scope is undefined'));   
      //  Определим тип запроса token
      let type = req.body.grant_type;
      //  Если запрос по паролю
      if (type === 'password'){
        //  Получить логин пароль
        const log = req.body.login;
        const pwd = req.body.password;
        //  Установить новые токены по паролю и логину
        return passport.setUserTokenByPwd(log, pwd, function(err, user_scope){
          //  Если возникла ошибка сообщить
          if (err)
            return res.status(500).send(getResponseObject('Error', err));
          //  Если нет информации о выданных токенах вернуть ошибку
          if (!user_scope)
            return res.status(500).send(getResponseObject('Error', 'Scope is null'));
          // Формирование ответа
          const data = { content : user_scope };
          if (scope !== true)
            data.SERVICE = scope;
          //  отправить ответ
          return res.status(200).send(data);
        });
      } else if (type === 'refresh_token'){
        //  Если запрос по refresh token'у
        const token = req.body.refresh_token;
        passport.setUserTokenByToken(token,)
      } else {
        //  Если запрос ни по паролю, ни по токену
        return res.status(400).send(getResponseObject('Error', 'Parametr "grant_type" is undefined'));
      }
    });
  } 
  return res.status(401).send(getResponseObject('Service error', 'Header "Authorization" is undefined'));
});


function getResponseObject(status, response){
  return {
    status : status,
    message : response
  };
}
//router.post('/token', oauth2.token);

// router.post('/userId', passport.authenticate(['basic', 'bearer'], {session : false}), function(req, res, next){
//   res.status(200).send(req.user.userId);
// });

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