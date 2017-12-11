const   basic       = require('basic-auth'),
        strategy    = require('./../../config/passport-stategy');
const basicType = /basic/i;
const bearerType = /bearer/i;


module.exports = {
    /**
     * Функция проверки авторизации сервиса по заголовку Authorization
     */
    checkServiceAuthorization : function(header_authorization, callback){
        const type = basicType.test(header_authorization);
        //  Если тип авторизации Basic
        if (type){
            return checkBasicAuthorization(header_authorization, callback);
        } else if (bearerType.test(header_authorization)){
            //  Если тип авторизации Bearer token
            return checkBearerAuthorization(header_authorization, callback);
        }
        return callback('Unknown authorization type', 400, null);
    },
    /**
     * Установка token'ов для пользователя
     */
    setUserTokenByPwd : function(log, pwd, callback){
        return strategy.createTokenForUser(log, pwd, function(err, status, scope){
            if (err)
                return callback(err, status, null);
            if (!scope)
                return callback(null, status, null);
            return callback(null, null, scope);
        });
    },
    setUserTokenByToken : function(token, callback){
        return strategy.createTokenForUserByToken(token, function(err, status, scope){
            if (err)
                return callback(err, status, null);
            if (!scope)
                return callback(null, status, null);
            return callback(null, null, scope);
        });
    },
    checkUserByBearer : function(header_text , callback){
        if (!bearerType.test(header_text))
            return callback('Is not Bearer token', 400, null);
        const token = getBearer(header_text);
        return strategy.checkUserByAccessToken(token, function(err, status, user){
            if (err)
                return callback(err, status);
            if (status || !user)
                return callback('User not found', status);
            return callback(null, status, user);
        });
    }   
}

//  Проверка авторизации сервиса по Basic аутентификации
function checkBasicAuthorization(header_authorization, callback){
    //  Получаем app.name и app.pass
    const service = basic.parse(header_authorization);
    //  Проверяем сервис с данными name и pass
    return strategy.checkService(service.name, service.pass, function(err, status, application){
        if (err)
            return callback(err, status, null);
        if (!application)
            return callback(null, status, null);
        //  Так как авторизация происходила по логину/паролю выдать токен
        return strategy.setNewAccessTokenToApp(application, function(err, status, scope){
            if (err)
                return callback(err, status, null);
            if (!scope)
                return callback(null, status, null);
            return callback(null, null, scope);
        });
    });
}

function checkBearerAuthorization(header_authorization, callback){
    const serviceToken = getBearer(header_authorization);
    return strategy.checkServiceAccessToken(serviceToken, function(err, status, result){
        if (err)
            return callback(err, status, null);
        return callback(null, status, result);
    });
}

function getBearer(token){
  token = String(token);
  token = token.slice(7);
  return token;
}