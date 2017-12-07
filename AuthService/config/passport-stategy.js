const   config          	= require('./config'),
        passport       		= require('passport'),
        basicStrategy   	= require('passport-http').BasicStrategy,
        passwordStrategy 	= require('passport-oauth2-client-password').Strategy,
        bearerStrategy  	= require('passport-http-bearer').Strategy,
        UserModel   			= require('./../app/models/users').userModel,
        ClientModel 			= require('./../app/models/client').clientModel,
        AccessToken  			= require('./../app/models/accesstoken').tokenModel,
        RefreshToken 			= require('./../app/models/refreshtoken').tokenModel;

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

passport.use(new cliPwdStr(
    function(clientId, clientSecret, done){
        console.log('use Pwd strategy');
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

passport.use(new bearerStr(
    function(accessToken, done){
        console.log('use Bearer strategy');
        TokenModel.findOne({token : accessToken, tokenType : 'access'},function(err, token){
            if (err)
                return done(err);
            if (!token)
                return done(null, false);
            if(Math.round((Date.now() - token.lastUse)/1000) > config.get('security:tokenLife')){
                TokenModel.remove({token : accessToken}, function(err){
                    if (err) return done(err);
                });
                return done(null, false, {message : 'Token expired'});
            }
            UserModel.findById(token.userId, function(err, user){
                if (err)
                    return done(err);
                if (!user)
                    return done(null, false, {message: 'Unkown user'});
                let info = {scope : '*'};
                done(null, user, info);
            });
        });
    }
))
