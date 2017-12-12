const express   = require('express'),
      router    = express.Router(),
      passport  = require('./../logic/my-passport');

module.exports = (app) => {
  app.use('/auth', router);
};

router.post('/token', function(req, res, next){
  const header_auth = req.headers['authorization'];     //  считываем заголовок из headers
  //  если такой заголовк есть и он не пуст
  if (header_auth && typeof(header_auth) !== 'undefined'){
    //  Проверим авторизацию сервиса aggregator
    return passport.checkServiceAuthorization(header_auth, function(err, status, scope){
      //  Если ошибка вернуть ошибку для сервиса
      if (err)
        return res.status(status).send(getResponseObject('Service error', err));
      //  Если данные для aggregator не определены вернуть ошибку
      if (!scope)
        return res.status(status).send(getResponseObject('Service error', 'Scope is undefined'));   
      //  Определим тип запроса token
      let type = req.body.grant_type;
      //  Если запрос по паролю
      if (type === 'password'){
        return passwordAuthorization(req, res, next, scope);
      } else if (type === 'refresh_token'){
        return refreshTokenAuthorization(req, res, next, scope);
      } else {
        //  Если запрос ни по паролю, ни по токену
        return res.status(400).send(getResponseObject('Error', 'Parametr "grant_type" is undefined'));
      }
    });
  } 
  return res.status(401).send(getResponseObject('Service error', 'Header "Authorization" is undefined'));
});

router.get('/userId', function(req, res, next){
  //  считываем заголовок из header
  const header_auth = req.headers['authorization'];
  //  если такой заголовк есть и он не пуст
  if (header_auth && typeof(header_auth) !== 'undefined'){
    //  Проверим авторизацию сервиса aggregator
    return passport.checkServiceAuthorization(header_auth, function(err, status, scope){
      if (err)
        return res.status(status).send(getResponseObject('Service error', err));
      if (!scope)
        return res.status(status).send(getResponseObject('Service error', 'Scope is null'));
      const user_auth = req.headers['user-authorization'];
      if (user_auth && typeof(user_auth) !== 'undefined'){
        return passport.checkUserByBearer(user_auth, function(err, status, user){
          if (err)
            return res.status(status).send(getResponseObject('Error', err));
          if (!user)
            return res.status(status).send(getResponseObject('Error', 'User is null'));
          return res.status(200).send({id : user.id});
        });
      }
      return res.status(401).send(getResponseObject('Error', 'Header "user-authorization" is undefined'));
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

function passwordAuthorization(req, res, next, service_scope){
  //  Получить логин пароль
  const log = req.body.login;
  const pwd = req.body.password;
  //  Если логин/пароль не определены отправить bad request
  if (!log || !pwd || typeof(log) == 'undefined' || typeof(pwd) == 'undefined')
    return res.status(400).send(getResponseObject('Error', 'Bad request login or password is undefined'));
  //  Установить новые токены по паролю и логину
  return passport.setUserTokenByPwd(log, pwd, function(err, status, user_scope){
    //  Если возникла ошибка сообщить
    if (err)
      return res.status(status).send(getResponseObject('Error', err));
    //  Если нет информации о выданных токенах вернуть ошибку
    if (!user_scope)
      return res.status(status).send(getResponseObject('Error', 'User for this password and login is not found'));
    // Формирование ответа
    const data = { content : user_scope };
    if (service_scope !== true)
      data.service = service_scope;
    //  отправить ответ
    return res.status(200).send(data);
  });
}

function refreshTokenAuthorization(req, res, next, service_scope){
  //  Если запрос по refresh token'у
  const token = req.body.refresh_token;
  if (!token || typeof(token) == 'undefined')
    return res.status(400).send(getResponseObject('Error', 'Token is undefined'));
  return passport.setUserTokenByToken(token, function(err, status, user_scope){
    if (err)
      return res.status(status).send(getResponseObject('Error', err));
    if (!user_scope)
      return res.status(status).send(getResponseObject('Error', 'Scope is null'));
    const data = {content : user_scope};
    if (service_scope !== true)
      data.service = service_scope;
    return res.status(200).send(data);
  });
}

/*
  router.get('/create', function(req, res, next){
    let model = mongoose.model('User');
    let user = new model({
      login: 'moderator',
      password : '4444'
    });
    user.save(function(err, nw_user){
      if (err)
        return res.send(err);
      return res.send(nw_user);
    });
  let ClientModel = mongoose.model('Client');
  var client = new ClientModel({ name: "OurService iOS client v1", clientId: "mobileV1", clientSecret:"abc123456" });
    client.save(function(err, client) {
        if(err) return log.error(err);
        res.send(null);
    });
  });
*/