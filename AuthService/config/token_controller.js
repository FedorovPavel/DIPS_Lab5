const   oauth2orize     = require('oauth2orize'),
        passport        = require('passport'),
        crypto          = require('crypto'),
        config          = require('./config'),
        mongoose        = require('mongoose'),
        UserModel       = mongoose.model('User'),
        ClientModel     = mongoose.model('Client'),
        AcTokenMod      = mongoose.model('AccessToken'),
        RefTokenMod     = mongoose.model('RefreshToken');

const server = oauth2orize.createServer();

server.exchange(oauth2orize.exchange.password(function(client, name, password, scope, done){
    UserModel.findOne({login: name}, function(err, user){
        if (err)
            return done(err);
        if (!user)
            return done(null, false);
        if (!user.checkPassword(password))
            return done(null, false);
        RefTokenMod.remove({userId: user.userId, clientId : client.clientId}, function(err){
            if (err)
                return done(err);
        });
        AcTokenMod.remove({userId : user.userId, clientId : client.clientId}, function(err){
            if (err)
                return done(err);
        });

        let tokenValue = crypto.randomBytes(32).toString('base64');
        let refreshTokenValue = crypto.randomBytes(32).toString('base64');
        let token = new AcTokenMod({
            token: tokenValue, clientId: client.clientId, userId : user.id
        });
        let refreshToken = new RefTokenMod({
            token: refreshTokenValue, clientId : client.clientId, userId : user.id
        });
        refreshToken.save(function(err){
            if (err)
                return done(err);
        });
        let info = {scope : '*'};
        token.save(function(err, token){
            if (err)
                return done(err);
            done(null, tokenValue, refreshTokenValue, {'expires_in' : config.security.tokenLife});
        });
    });
}));

server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done){
    RefTokenMod.findOne({token : refreshToken}, function(err, token){
        if (err)
            return done(err);
        if (!token)
            return done(null, false);
        UserModel.findById(token.userId, function(err, user){
            if (err)
                return done(err);
            if (!user)
                return done(null, false);
            RefTokenMod.remove({userId : user.userId, clientId : client.clientId}, function(err){
                if (err)
                    return done(err);
            });
            AcTokenMod.remove({userId : user.userId, clientId : client.clientId}, function(err){
                if (err)
                    return done(err);
            });
            let tokenValue = crypto.randomBytes(32).toString('base64');
            let refreshTokenValue = crypto.randomBytes(32).toString('base64');
            let token = new AcTokenMod({
                token : tokenValue, clientId : client.clientId, userId : user.userId 
            });
            let refToken = new RefTokenMod({
                token : refreshTokenValue, clientId : client.clientId, userId : user.userId
            });
            refToken.save(function(err){
                if (err)
                    return done(err);
            });
            token.save(function(err, token){
                if (err)
                    return done(err);
                done(null, tokenValue, refreshTokenValue, {'expires_in' : config.get('security:tokenLife')});
            });
        });
    });
}));

exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], {session : false}), server.token(), server.errorHandler()
];