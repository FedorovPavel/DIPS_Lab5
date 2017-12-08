const   config          	= require('./config'),
        passport       		= require('passport'),
				basicStrategy   	= require('passport-http').BasicStrategy,
				bearerStrategy 		= require('passport-http-bearer').Strategy,
        //passwordStrategy 	= require('passport-oauth2-client-password').Strategy,
        UserModel   			= require('./../app/models/users').userModel,
        // ClientModel 			= require('./../app/models/client').clientModel,
        AccessToken  			= require('./../app/models/accesstoken').tokenModel,
        RefreshToken 			= require('./../app/models/refreshtoken').tokenModel;

/* Вариант для appId и appSecret
	passport.use(new basicStrategy(
			function(appId, appSecret, done){
					ClientModel.findOne({clientId : appId}, function(err, app_cli){
							if (err)
									return done(err);
							if (!app_cli)
									return done(null, false);
							if (app_cli.clientSecret != appSecret)
									return done(null, false);
							return done(null, app_cli);
					});
			}
	));
	passport.use(new passwordStrategy(
			function(clientId, clientSecret, done){
					ClientModel.findOne({clientId: clientId}, function(err, client){
							if (err) 
									return done(err);
							if (!client)
									return done(null, false);
							if (client.clientSecret != clientSecret)
									return done(null, false);
							return done(null, client);
					});
			}
	));
*/

//  Вариант OAuth без appId и appSecret
//  Стратегия авторизации по логину-паролю
passport.use(new basicStrategy(
	function(userName, userPwd, done){
		//  Поиск юзера по логину
		console.log('Проверка пользователя по login|password');
		UserModel.findOne({login : userName}, function(err, user){
			//  Если ошибка вернуть ошибку 
			if (err)
				return done(err);
			//  Нет такого пользователя - вернуть провал верификации 
			if (!user)
				return done(null, false);
			//  Если не совпадает пароль - вернуть провал верификации 
			if (!user.checkPassword(userPwd))
				return done(null, false);
			return done(null, user);
		});
	}
));

//  Стратегия для Bearer токена
passport.use(new bearerStrategy(
  function(accessToken, done){
		//  Ищем токен
    AccessToken.findOne({token : accessToken},function(err, token){
			//  Если ошибка вернуть ошибку
      if (err)
				return done(err);
			//  Если токен не найден вернуть провал верификации
      if (!token)
				return done(null, false);
			//  Расчет времени жизни
			const timeLife = Math.round((Date.now() - token.created)/1000); // В секундах
      if(timeLife > config.security.tokenLife){
				//  Время жизни токена истекло надо его удалить 
        AccessToken.remove({token : accessToken}, function(err){
          if (err) return done(err);
				});
				//  Сообщить что верификация провалена, токен стух
        return done(null, false, {message : 'Token expired'});
			}
			//  Поиск владельца токена
      UserModel.findById(token.userId, function(err, user){	
				//  Если ошибка вернуть ошибку
        if (err)
					return done(err);
				//  Если владелец не найден
        if (!user)
					return done(null, false, {message: 'Unkown user'});
				// let info = {
				// 	access_token 	: token,
				// 	token_type		:"bearer",
				// 	expires_in		:config.security.tokenLife
				// }
				var info = {scope : '*'};
        return done(null, user, info);
      });
    });
  }
));