const   config      = require('./config'),
        passport    = require('passport'),
        basicStr    = require('passport-http').BasicStrategy,
        cliPwdStr   = require('passport-oauth2-client-password').Strategy,
        bearerStr   = require('passport-http-bearer').Strategy,
        mongoose    = require('mongoose'),
        UserModel   = mongoose.model('User'),
        ClientModel = mongoose.model('Client'),
        AcTokenMod  = mongoose.model('AccessToken'),
        RefTokenMod = mongoose.model('RefreshToken');

passport.use(new basicStr(
    function(username, password, done){
        console.log('use Basic strategy');
        ClientModel.findOne({clientId : username}, function(err, client){
            if (err)
                return done(err);
            if (!client)
                return done(null, false);
            if (client.clientSecret != password)
                return done(null, false);
            return done(null, client);
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
