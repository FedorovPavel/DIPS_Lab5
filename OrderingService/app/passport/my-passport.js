const basic   		= require('basic-auth'),
			strategy 		= require('./passport-strategy/passport-strategy'),
      basicType 	= /basic/i,
      bearerType 	= /bearer/i;


module.exports = {
	checkServiceAuthorization : function(req, res, callback){
		const header_auth = req.headers['authorization'];
		if (!header_auth || typeof(header_auth) === 'undefined' || header_auth.length == 0)
			return res.status(401).send({status : "Service error", message : "Authorization header is null"});
		if (basicType.test(header_auth))
			return checkBasicAuthorization(res, header_auth, callback);
		else if (bearerType.test(header_auth))
			return checkBearerAuthorization(res, header_auth, callback);
		return res.status(401).send({status : "Service error", message : "Unknown authorization type"});
	}
}

//  Проверка авторизации сервиса по Basic аутентификации
function checkBasicAuthorization(res, authInfo, callback){
	const service = basic.parse(authInfo);
	return strategy.checkService(service.name, service.pass, function(err, status, app){
    if (err)
      return res.status(status).send({status: 'Service error', message : err});
		return strategy.setNewAccessTokenToApp(app, function(err, status, scope){
      if (err)
        return res.status(status).send({status : 'Service error', message : err});
      return callback(scope);
    });
  });
}

function checkBearerAuthorization(res, authInfo, callback){
	const getToken = function(token){
		token = String(token);
		token = token.slice(7);
		return token;
	};
	const serviceToken = getToken(authInfo);
	if (!serviceToken || typeof(serviceToken) === 'undefined' || serviceToken.length == 0)
		return res.status(401).send({status : 'Service error', message: 'Service token is undefined'});
  return strategy.checkServiceAccessToken(serviceToken, function(err, status, result){
    if (err)
      return res.status(status).send({status:'Service error', message : err});
    return callback(undefined);
  });
}