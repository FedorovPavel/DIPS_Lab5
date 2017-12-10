const   basic       = require('basic-auth'),
        strategy    = require('./../../config/passport-stategy');
const basicType = /basic/i;


module.exports = {
    /**
     * Функция проверки авторизации сервиса по заголовку Authorization
     */
    checkServiceAuthorization : function(header_authorization, callback){
        const type = basicType.test(header_authorization);
        //  Если тип авторизации Basic
        if (type){
            return checkBasicAuthorization(header_authorization, callback);
        } else {
            //  Если тип авторизации Bearer token
            return checkBearerAuthorization(header_authorization, callback);
        }
    },
    /**
     * Установка token'ов для пользователя
     */
    setUserTokenByPwd : function(log, pwd, callback){
        return strategy.createTokenForUser(log, pwd, function(err, scope){
            if (err)
                return callback(err, null);
            if (!scope)
                return callback(null, null);
            return callback(null, scope);
        });
    },
    setUserTokenByToken : function(token, callback){
        return strategy.createTokenForUserByToken(token, function(err, scope){
            if (err)
                return callback(err, null);
            if (!scope)
                return callback(null, null);
            return callback(null, scope);
        });
    },
}

function checkBasicAuthorization(header_authorization, callback){
    const service = basic.parse(header_authorization);
    return strategy.checkService(service.name, service.pass, function(err, application){
        if (err)
            return callback(err, null);
        if (!application)
            return callback(null, null);
        return strategy.setNewAccessTokenToApp(application, function(err, scope){
            if (err)
                return callback(err, null);
            if (!application)
                return callback(null, null);
            if (!scope)
                return callback(null, null);
            return callback(null, scope);
        });
    });
}

function checkBearerAuthorization(header_authorization, callback){
    const serviceToken = getBearer(header_authorization);
    return strategy.checkServiceAccessToken(serviceToken, function(err, result){
        if (err)
            return callback(err, null);
        return callback(null, result);
    });
}

function getBearer(token){
  token = String(token);
  token = token.slice(7);
  return token;
}