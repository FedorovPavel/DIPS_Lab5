//  DESCRIPTION
/*
    Данный модуль фактически эмулирует OAuth сервис.
    Для работы создается OAuth сервер 
    Меняются два метода для запросов
    Обработчики определяются полем grant_type
    1) Для запроса получения токена по паролю
    Для получения доступа по паролю необходимо username и password поля
    2) Для запроса на обновить токен по refresh токену
    
*/

const   oauth2orize     = require('oauth2orize'),
        passport        = require('passport'),
        crypto          = require('crypto'),
        config          = require('./config'),
        mongoose        = require('mongoose'),
        UserModel       = require('./../app/models/users').userModel,
        //ClientModel     = mongoose.model('Client'),
        AccessToken     = require('./../app/models/accesstoken').tokenModel,
        RefreshToken    = require('./../app/models/refreshtoken').tokenModel;

const server = oauth2orize.createServer();

//  Grant password
server.exchange(oauth2orize.exchange.password(function(client, userName, userPwd, scope, done){
    //  Ищем юзера с указанным логином
    UserModel.findOne({login: userName}, function(err, user){
        //  Если ошибка вернут ошибку
        if (err)
            return done(err);
        //  Если пользователя нет вернуть провал получения токена
        if (!user)
            return done(null, false);
        //  Если пароль не совпадает вернуть провал получения токена
        if (!user.checkPassword(userPwd))
            return done(null, false);
        //  Удаляем refreshToken
        RefreshToken.remove({userId: user.userId}, function(err){
            if (err)
                return done(err);
        });
        //  Удаляем токен
        AccessToken.remove({userId : user.userId}, function(err){
            if (err)
                return done(err);
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
        });
        //  Сохраняем токен в БД
        token.save(function(err, token){
            if (err)
                return done(err);
            //  Считать валидацию OAuth успешной, вернуть 
            //  token
            //  refreshToken
            //  Время жизни токена
            done(null, tokenValue, refreshTokenValue, {'expires_in' : config.security.tokenLife});
        });
    });
}));

//  Grant token
server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done){
    //  Ищем указанный refreshToken
    RefreshToken.findOne({token : refreshToken}, function(err, token){
        //  Если токен не найден вернуть ошибку
        if (err)
            return done(err);
        //  Если нет такого токена обновление токена провалено
        if (!token)
            return done(null, false);
        //  Поиск юзера владельца refresh токена
        UserModel.findById(token.userId, function(err, user){
            //  Если возникла ошибка 
            if (err)
                return done(err);
            //  Если пользователь не найден - провал обновления токена
            if (!user)
                return done(null, false);
            //  Удаление старого refresh токена
            RefreshToken.remove({userId : user.userId}, function(err){
                if (err)
                    return done(err);
            });
            //  Удаление старого токена
            AccessToken.remove({userId : user.userId}, function(err){
                if (err)
                    return done(err);
            });
            //  Создание токена
            let tokenValue = crypto.randomBytes(32).toString('base64');
            //  Создание refresh токена
            let refreshTokenValue = crypto.randomBytes(32).toString('base64');
            //  Создание экземпляра токена для записи в БД
            let token = new AccessToken({
                token   : tokenValue, 
                userId  : user.userId 
            });
            //  Создание экземпляра refresh токена для записи в БД
            let refToken = new RefreshToken({
                token   : refreshTokenValue, 
                userId  : user.userId
            });
            //  записать refresh токен в БД
            refToken.save(function(err){
                if (err)
                    return done(err);
            });
            //  записать токен в БД
            token.save(function(err, token){
                if (err)
                    return done(err);
                //  Считать обновление refresh токена OAuth успешным, вернуть 
                //  token
                //  refreshToken
                //  Время жизни токена
                done(null, tokenValue, refreshTokenValue, {'expires_in' : config.security.tokenLife});
            });
        });
    });
}));

exports.token = [passport.authenticate('basic', {session : false}), server.token(), server.errorHandler()];