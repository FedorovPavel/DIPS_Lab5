const   config				= require('./config'),
				crypto				= require('crypto'),
      	UserModel   	= require('./../app/models/users').userModel,
        ClientModel 	= require('./../app/models/client').clientModel,
        AccessToken  	= require('./../app/models/accesstoken').tokenModel,
        RefreshToken 	= require('./../app/models/refreshtoken').tokenModel;

//  Стратегия для распознования appId и appSecret
module.exports = {
	checkService : function(appId, appSecret, done){
		console.log('Проверка сервиса запрашивающего авторизацию по appId, appSecret');
		return ClientModel.findOne({appId : appId}, function(err, app_cli){
			if (err)
				return done(err);
			if (!app_cli)
				return done(null, false);
			if (app_cli.appSecret != appSecret)
				return done(null, false);
			return done(null, app_cli);
		});
	},
	setNewAccessTokenToApp : function(application, done){
		console.log('Выдача нового токена для app {' + application.name + '}');
		let tokenValue = crypto.randomBytes(32).toString('base64');
		let token = new AccessToken({
			userId 	: application.id,
			token		: tokenValue
		});
		return token.save(function(err, token){
			if (err)
				return done(err, null);
			if (!token)
				return done(null, null);
			let scope = {
				token : tokenValue,
				expires_in : config.security.serviceTokenLife
			};
			return done(null, scope);
		});
	},
	createTokenForUser : function(login, password, done){
		//  Ищем юзера с указанным логином
		return UserModel.findOne({login: login}, function(err, user){
			//  Если ошибка вернут ошибку
			if (err)
				return done(err);
			//  Если пользователя нет вернуть провал получения токена
			if (!user)
				return done(null, false);
			//  Если пароль не совпадает вернуть провал получения токена
			if (!user.checkPassword(password))
				return done(null, false);
			//  Удаляем refreshToken
			RefreshToken.remove({userId: user.userId}, function(err){
				if (err) {
					return done(err);
				}
				return console.log('Удален refresh-токен для пользователя ' + user.name);
			});
			//  Удаляем токен
			AccessToken.remove({userId : user.userId}, function(err){
				if (err)
					return done(err);
				return console.log('Удален access-токен для пользователя ' + user.name);
			});
			//  создаем токен
			let tokenValue = crypto.randomBytes(32).toString('base64');
			//  создаем refresh токен
			let refreshTokenValue = crypto.randomBytes(32).toString('base64');
			//  создаем объект БД токен
			let token = new AccessToken({
					token   : tokenValue,
					userId  : user.id
			});
			//  Создаем объект БД refresh-токен
			let refreshToken = new RefreshToken({
					token   : refreshTokenValue, 
					userId  : user.id
			});
			//  Сохраняем refresh-токен в БД
			refreshToken.save(function(err){
				if (err)
					return done(err);
				//  Сохраняем токен в БД
				token.save(function(err, token){
					if (err)
							return done(err);
					//  Считать валидацию OAuth успешной, вернуть 
					//  token
					//  refreshToken
					//  Время жизни токена
					let scope = {
						user : user,
						access_token : tokenValue,
						refresh_token : refreshTokenValue,
						expires_in	: config.security.userTokenLife
					}
					return done(null, scope);
				});
			});
		});
	},
	checkServiceAccessToken : function(accessToken, done){
		console.log('Проверка сервиса запрашивающего авторизацию по token');
		return AccessToken.findOne({token : accessToken}, function(err, token){
			if (err)
				return done(err);
			if (!token)
				return done(null, false);
			const timeLife = (Date.now() - token.created)/1000;
			if (timeLife > config.security.serviceTokenLife){
				token.remove(function(err){
					if (err)
						return done(err, false);
				});
				return done(null, false);
			}
			const appId = token.userId;
			ClientModel.findById(appId, function(err, application){
				if (err)
					return done(err, false);
				if (!application)
					return done(null, false);
				return done(null, true);
			});
		});
	}
}
// //  Grant token
// server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done){
//     //  Ищем указанный refreshToken
//     RefreshToken.findOne({token : refreshToken}, function(err, token){
//         //  Если токен не найден вернуть ошибку
//         if (err)
//             return done(err);
//         //  Если нет такого токена обновление токена провалено
//         if (!token)
//             return done(null, false);
//         //  Поиск юзера владельца refresh токена
//         UserModel.findById(token.userId, function(err, user){
//             //  Если возникла ошибка 
//             if (err)
//                 return done(err);
//             //  Если пользователь не найден - провал обновления токена
//             if (!user)
//                 return done(null, false);
//             //  Удаление старого refresh токена
//             RefreshToken.remove({userId : user.userId}, function(err){
//                 if (err)
//                     return done(err);
//             });
//             //  Удаление старого токена
//             AccessToken.remove({userId : user.userId}, function(err){
//                 if (err)
//                     return done(err);
//             });
//             //  Создание токена
//             let tokenValue = crypto.randomBytes(32).toString('base64');
//             //  Создание refresh токена
//             let refreshTokenValue = crypto.randomBytes(32).toString('base64');
//             //  Создание экземпляра токена для записи в БД
//             let token = new AccessToken({
//                 token   : tokenValue, 
//                 userId  : user.userId 
//             });
//             //  Создание экземпляра refresh токена для записи в БД
//             let refToken = new RefreshToken({
//                 token   : refreshTokenValue, 
//                 userId  : user.userId
//             });
//             //  записать refresh токен в БД
//             refToken.save(function(err){
//                 if (err)
//                     return done(err);
//             });
//             //  записать токен в БД
//             token.save(function(err, token){
//                 if (err)
//                     return done(err);
//                 //  Считать обновление refresh токена OAuth успешным, вернуть 
//                 //  token
//                 //  refreshToken
//                 //  Время жизни токена
//                 done(null, tokenValue, refreshTokenValue, {'expires_in' : config.security.tokenLife});
//             });
//         });
//     });



//  Стратегия авторизации по логину-паролю
// passport.use(new passwordStrategy(
// 	function(userName, userPwd, done){
// 		//  Поиск юзера по логину
// 		console.log('Проверка пользователя по login|password');
// 		UserModel.findOne({login : userName}, function(err, user){
// 			//  Если ошибка вернуть ошибку 
// 			if (err)
// 				return done(err);
// 			//  Нет такого пользователя - вернуть провал верификации 
// 			if (!user)
// 				return done(null, false);
// 			//  Если не совпадает пароль - вернуть провал верификации 
// 			if (!user.checkPassword(userPwd))
// 				return done(null, false);
// 			return done(null, user);
// 		});
// 	}
// ));

// //  Стратегия для Bearer токена
// passport.use(new (
//   function(accessToken, done){
// 		//  Ищем токен
//     AccessToken.findOne({token : accessToken},function(err, token){
// 			//  Если ошибка вернуть ошибку
//       if (err)
// 				return done(err);
// 			//  Если токен не найден вернуть провал верификации
//       if (!token)
// 				return done(null, false);
// 			//  Расчет времени жизни
// 			const timeLife = Math.round((Date.now() - token.created)/1000); // В секундах
//       if(timeLife > config.security.tokenLife){
// 				//  Время жизни токена истекло надо его удалить 
//         AccessToken.remove({token : accessToken}, function(err){
//           if (err) return done(err);
// 				});
// 				//  Сообщить что верификация провалена, токен стух
//         return done(null, false, {message : 'Token expired'});
// 			}
// 			//  Поиск владельца токена
//       UserModel.findById(token.userId, function(err, user){	
// 				//  Если ошибка вернуть ошибку
//         if (err)
// 					return done(err);
// 				//  Если владелец не найден
//         if (!user)
// 					return done(null, false, {message: 'Unkown user'});
// 				// let info = {
// 				// 	access_token 	: token,
// 				// 	token_type		:"bearer",
// 				// 	expires_in		:config.security.tokenLife
// 				// }
// 				var info = {scope : '*'};
//         return done(null, user, info);
//       });
//     });
//   }
// ));