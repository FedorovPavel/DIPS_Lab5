const   _CatalogHost    = 'http://localhost:3004',
        _OrderHost      = 'http://localhost:3002',
        _BillingHost    = 'http://localhost:3003',
        _AuthHost       = 'http://localhost:3001';

const   config  = require('./../../config/config');

var     AuthToken   = null,
        OrderToken  = null,
        BillingToken= null,
        CatalogToken= null;

module.exports = {
    //  AuthMethods
    getTokenByPwd : function(info, callback){
        let main_function = function(info, callback){
            const url = _AuthHost + '/auth/token';
            const options = createOptions(url, 'POST', AuthToken);
            const data = {
                grant_type  : 'password',
                login       : info.login,
                password    : info.password
            };
            return createAndSendHttpPostRequest(options, data, function(err, status, response){
                return responseHandlerObject(err, status, response, function(err, status, response){
                    const repeat = checkServicesInformationFromAuth(status, response, main_function, info, callback);
                    if (!repeat)
                        return callback(err, status, response);
                    return;
                });
            });
        }
        return main_function(info, callback);
    },
    getTokenByToken : function(info, callback){
        let main_function = function(info, callback){
            const url = _AuthHost + '/auth/token';
            const options = createOptions(url, 'POST', AuthToken);
            const data = {
                grant_type  : 'refresh_token',
                refresh_token : info.ref_token
            };
            return createAndSendHttpPostRequest(options, data, function(err, status, response){
                return responseHandlerObject(err, status, response, function(err, status, response){
                    const repeat = checkServicesInformationFromAuth(status, response, main_function, info, callback);
                    if (!repeat)
                        return callback(err, status, response);
                    return;
                });                
            });
        }
        return main_function(info, callback);
    },
    getUserInfo : function(info, callback){
        let main_function = function(info, callback){
            const url = _AuthHost + '/auth/userId';
            const options = createOptions(url, 'GET', AuthToken, info.token);
            return createAndSendGetHttpRequest(options, function(err, status, response){
                return responseHandlerObject(err, status, response, function(err, status, response){
                    let repeat = checkServicesInformationFromAuth(status, response, main_function, info, callback);
                    if (!repeat)
                        callback(err, status, response);
                    return;
                });
            });
        }
        return main_function(info, callback);
    },
    //  Catalog methods
    getCars: function (dataContainer, callback) {
        let main_function = function(data, callback){
            const url = _CatalogHost + '/catalog?page=' + data.page + '&count=' + data.count;
            const options = createOptions(url, 'GET', CatalogToken);
            return createAndSendGetHttpRequest(options, function (err, status, response) {
                return responseHandlerObject(err, status, response, function(err, status, response){
                    const repeat = checkServicesInformationFromCatalog(status, response, main_function, data, callback);
                    if (!repeat)
                        return callback(err, status, response);
                    return;
                });              
            });
        };
        return main_function(dataContainer, callback);
    },
    getCar: function (data, callback) {
        let main_function = function(data, callback){
            const url = _CatalogHost + '/catalog/' + data.id;
            const options = createOptions(url, "GET", CatalogToken);
            return createAndSendGetHttpRequest(options, function (err, status, response) {
                return responseHandlerObject(err, status, response, function (err, status, response) {
                    const repeat = checkServicesInformationFromCatalog(status, response, main_function, data, callback);
                    if (!repeat){
                        if (status == 200)
                            response = response.content;
                        return callback(err, status, response);
                    }
                    return;
                }); 
            });
        }
        return main_function(data, callback);
    },
    //  Orders methods
    createOrder: function (data, callback) {
        let main_function = function(data, callback){
            const url = _OrderHost + '/orders';
            const options = createOptions(url, "POST", OrderToken, null, data.userId);
            let clone = data;
            delete clone.userId;
            return createAndSendHttpPostRequest(options, clone, function (err, status, response) {
                return responseHandlerObject(err, status, response, function (err, status, response){
                    const repeat = checkServicesInformationFromOrder(status, response, main_function, data, callback);
                    if (!repeat){
                        return callback(err, status, response);
                    }
                    return;
                });               
            });
        }
        return main_function(data, callback);
    },
    getOrder: function (data, callback) {
        let main_function = function(data, callback){
            const url = _OrderHost + '/orders/' + data.orderId;
            const options = createOptions(url, "GET", OrderToken, null, data.userId);
            return createAndSendGetHttpRequest(options, function (err, status, response) {
                return responseHandlerObject(err, status, response, function(err, status, response){
                    const repeat = checkServicesInformationFromOrder(status, response, main_function, data, callback);
                    if (!repeat){
                        if (status == 200)
                            response = response.content;
                        return callback(err, status, response);
                    }
                    return;
                });
            });
        }
        return main_function(data, callback);
    },
    getOrders: function (data, callback) {
        let main_function = function(data, callback){
            const url = _OrderHost + '/orders?page=' + data.page + '&count=' + data.count;
            const options = createOptions(url, "GET", OrderToken, null, data.userId);
            return createAndSendGetHttpRequest(options, function (err, status, response) {
                return responseHandlerObject(err, status, response, function(err, status, response){
                    const repeat = checkServicesInformationFromOrder(status, response, main_function, data, callback) ;
                    if (!repeat)
                        return callback(err, status, response);
                    return;
                });
            });
        }
        return main_function(data, callback);
    },
    orderPaid: function (data, callback) {
        let main_function = function(data, callback){
            const url = _OrderHost + '/orders/' + data.order_id + '/paid/' + data.billing_id;
            const options = createOptions(url, "PUT", OrderToken, null, data.userId);
            return createAndSendPutWithFormHttpRequest(options, null, function (err, status, response) {
                return responseHandlerObject(err, status, response, function(err, status, response){
                    const repeat = checkServicesInformationFromOrder(status, response, main_function, data, callback);
                    if (!repeat){
                        return callback(err, status, response);
                    }
                    return;
                });
            });
        }
        return main_function(data, callback);
    },
    orderConfirm: function (data, callback) {
        let main_function = function(data, callback){
            const url = _OrderHost + '/orders/confirm/' + data.order_id;
            const options = createOptions(url, "PUT", OrderToken, null, data.userId);
            return createAndSendPutWithFormHttpRequest(options, null, function (err, status, response) {    
                return responseHandlerObject(err, status, response, function(err, status, response){
                    const repeat = checkServicesInformationFromOrder(status, response, main_function, data, callback);
                    if (!repeat)
                        if (status == 200)
                            response = response.content;
                        return callback(err, status, response);
                    return;
                });
            });
        }
        return main_function(data, callback);
    },
    orderComplete: function (data, callback) {
        let main_function = function(data, callback){
            const url = _OrderHost + '/orders/complete/' + data.orderId;
            const options = createOptions(url, "PUT", OrderToken, null, data.userId);
            return createAndSendPutWithFormHttpRequest(options, null, function (err, status, response) {
                return responseHandlerObject(err, status, response, function(err, status, response){
                    const repeat = checkServicesInformationFromOrder(status, response, main_function, data, callback);
                    if (!repeat)
                        if (status == 202)
                            response = response.content;
                        return callback(err, status, response);
                    return;
                });
            });
        }
        return main_function(data, callback);
    },
    checkOrderService : function(callback){
        let main_function = function(callback){
            const url = _OrderHost +'/orders/live';
            const options = createOptions(url, 'HEAD', OrderToken);
            return createAndSendHeadHttpRequest(options, function(err, status){
                const repeat = checkServicesInformationFromOrder(status, {status:'Service error'}, main_function, callback, null);
                if (!repeat)
                    return callback(err, status);
                return;
            });
        }
        return main_function(callback);
    },
    //  Billing methods
    createBilling: function (data, callback) {
        let main_function = function(data, callback){
            const url = _BillingHost + '/billings/';
            const options = createOptions(url, "POST", BillingToken, null, data.userId);
            let clone = data.data;
            return createAndSendHttpPostRequest(options, clone, function (err, status, response) {    
                return responseHandlerObject(err, status, response, function(err, status, response){
                    const repeat = checkServicesInformationFromBilling(status, response, main_function, data, callback);
                    if (!repeat)
                        if (status == 201)
                            response = response.content;
                        return callback(err, status, response);
                    return;
                });
            });
        }
        return main_function(data, callback);
    },
    getBilling: function (data, callback) {
        let main_function = function(data, callback){
            const url = _BillingHost + '/billings/' + data.billing_id;
            const options = createOptions(url, "GET", BillingToken, null, data.userId);
            return createAndSendGetHttpRequest(options, function (err, status, response) {
                return responseHandlerObject(err, status, response, function(err, status, response){
                    const repeat = checkServicesInformationFromBilling(status, response, main_function, data, callback);
                    if (!repeat)
                        if (status == 200)
                            response = response.content;
                        return callback(err, status, response);
                    return;
                });
            });
        }
        return main_function(data, callback);
    },
    revertBilling : function(data, callback){
        let main_function = function(data, callback){
            const url = _BillingHost + '/billings/' + data.billingId;
            const options = createOptions(url, 'DELETE', BillingToken, null, data.userId);
            return createAndSendDeleteHttpRequest(options, function(err, status, response){
                return responseHandlerObject(err, status, response, function(err, status, response){
                    const repeat = checkServicesInformationFromBilling(status, response, main_function, data, callback);
                    if (!repeat)
                        return callback(err, status, response);
                    return;
                });
            });
        }
        return main_function(data, callback);
    }
}

function createAndSendDeleteHttpRequest(options, callback) {
    const request = require('request');
    request.delete(options.uri, options, function (errors, response, body) {
        if (errors) {
            callback(errors, null, null);
        } else {
            callback(null, response.statusCode, body);
        }
    });
}

function createAndSendPutWithFormHttpRequest(options, data, callback) {
    const request = require('request');
    request.put(options.uri, options, function (errors, response, body) {
        if (errors) {
            callback(errors, null, null);
        } else {
            callback(null, response.statusCode, body);
        }
    }).form(data);
}

function createAndSendHttpPostRequest(options, data, callback) {
    const request = require('request');
    request.post(options.uri, options, function (errors, response, body) {
        if (errors) {
            callback(errors, null, null);
        } else {
            callback(null, response.statusCode, body);
        }
    }).form(data);
}

function createAndSendGetHttpRequest(options, callback) {
    const request = require('request');
    request.get(options.uri, options, function (errors, response, body) {
        if (errors) {
            callback(errors, null, null);
        } else {
            callback(null, response.statusCode, body);
        }
    });
}

function createAndSendHeadHttpRequest(options, callback){
    const request = require('request');
    request.head(options.uri, options, function(errors, response, body){
        if (errors){
            return callback(errors, null, null);
        } else {
            return callback(null, response.statusCode, body);
        }
    });
}

function createOptions(uri, method, token, user_token = null, userId = null) {
    let item = {
        method: method,
        uri: uri,
    };
    if (token){
        item.auth = {
            bearer : token.token
        }
    } else {
        item.auth = {
            user : config.app.id,
            pass : config.app.secret
        }
    }
    item.headers = {};
    if (user_token)
        item.headers['user-authorization'] = 'Bearer ' + user_token;
    if (userId)
        item.headers['userId'] = userId;
    return item;
}

function responseHandlerObject(err, status, response, callback) {
    if (err) {
        if (err.code == "ECONNREFUSED")
            return callback(err, 503, 'Sorry. Service is not available, please try again later');
        else {
            status = (status || typeof(status) != 'undefined') ? status : 500;
            return callback(err, status, response);
        }
    } else {
        if (response) {
            const object = JSON.parse(response);
            return callback(err, status, object);
        } else {
            return callback(err, status, null);
        }
    }
}

function checkServicesInformationFromAuth(status, response, method, info, callback){
    if (status == 401 && response.status == 'Service error'){
        console.log('Token AuthToken not topical');
        delete AuthToken;
        AuthToken = null;
        method(info, callback);
        return true;
    } else if (typeof(response.service) != 'undefined'){
        console.log('Set new AuthToken Token');
        AuthToken = response.service;
        delete response.service;
    }
    return false;
}

function checkServicesInformationFromCatalog(status, response, method, info, callback){
    if (status == 401 && response.status == 'Service error'){
        console.log('Token Catalog not topical');
        delete CatalogToken;
        CatalogToken = null;
        method(info, callback);
        return true;
    } else if (typeof(response.service) != 'undefined'){
        console.log('Set new CatalogToken');
        CatalogToken = response.service;
        delete response.service;
    }
    return false;
}

function checkServicesInformationFromOrder(status, response, method, info, callback){
    if (status == 401 && response.status == 'Service error'){
        console.log('OrderToken not topical');
        delete OrderToken;
        OrderToken = null;
        method(info, callback);
        return true;
    } else if (typeof(response.service) != 'undefined'){
        console.log('Set new OrderToken');
        OrderToken = response.service;
        delete response.service;
    }
    return false;
}

function checkServicesInformationFromBilling(status, response, method, info, callback){
    if (status == 401 && response.status == 'Service error'){
        console.log('BillingToken not topical');
        delete BillingToken;
        BillingToken = null;
        method(info, callback);
        return true;
    } 
    if (response && typeof(response.service) != 'undefined'){
        console.log('Set new BillingToken');
        BillingToken = response.service;
        delete response.service;
    }
    return false;
}