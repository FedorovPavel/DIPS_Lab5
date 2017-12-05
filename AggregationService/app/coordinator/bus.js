const   _CatalogHost    = 'http://localhost:3004',
        _OrderHost      = 'http://localhost:3002',
        _BillingHost    = 'http://localhost:3003';
module.exports = {
    getCars: function (page, count, callback) {
        const url = _CatalogHost + '/catalog?page=' + page + '&count=' + count;
        const options = createOptions(url, 'GET');
        createAndSendGetHttpRequest(options, function (err, status, response) {
            return responseHandlerObject(err, status, response, callback);
        });
        return;
    },
    /* getCarsByIDs : function(ids, callback){
        const url = _CatalogHost + '/catalog/ids?ids=' + ids;
        const options = createOptions(url, "GET");
        createAndSendGetHttpRequest(options, function(err, status, response){
            return responseHandlerArrayObject(err, status, response, callback);
        });
        return;
    },*/
    getCar: function (id, callback) {
        const url = _CatalogHost + '/catalog/' + id;
        const options = createOptions(url, "GET");
        createAndSendGetHttpRequest(options, function (err, status, response) {
            return responseHandlerObject(err, status, response, callback);
        });
        return;
    },
    createOrder: function (object, callback) {
        const url = _OrderHost + '/orders';
        const options = createOptions(url, "POST");
        createAndSendHttpPostRequest(options, object, function (err, status, response) {
            return responseHandlerObject(err, status, response, callback);
        });
        return;
    },
    getOrder: function (order_id, callback) {
        const url = _OrderHost + '/orders/' + order_id;
        const options = createOptions(url, "GET");
        createAndSendGetHttpRequest(options, function (err, status, response) {
            return responseHandlerObject(err, status, response, callback);
        });
        return;
    },
    getOrders: function (page, count, callback) {
        const url = _OrderHost + '/orders?page=' + page + '&count=' + count;
        const options = createOptions(url, "GET");
        createAndSendGetHttpRequest(options, function (err, status, response) {
            return responseHandlerObject(err, status, response, callback);
        });
        return;
    },
    orderPaid: function (order_id, billing_id, callback) {
        const url = _OrderHost + '/orders/' + order_id + '/paid/' + billing_id;
        const options = createOptions(url, "PUT");
        createAndSendPutWithFormHttpRequest(options, null, function (err, status, response) {
            return responseHandlerObject(err, status, response, callback);
        });
        return;
    },
    orderConfirm: function (order_id, callback) {
        const url = _OrderHost + '/orders/confirm/' + order_id;
        const options = createOptions(url, "PUT");
        createAndSendPutWithFormHttpRequest(options, null, function (err, status, response) {
            return responseHandlerObject(err, status, response, callback);
        });
        return;
    },
    orderComplete: function (order_id, callback) {
        const url = _OrderHost + '/orders/complete/' + order_id;
        const options = createOptions(url, "PUT");
        createAndSendPutWithFormHttpRequest(options, null, function (err, status, response) {
            return responseHandlerObject(err, status, response, callback);
        });
        return;
    },
    checkOrderService : function(callback){
        const url = _OrderHost +'/orders/live';
        const options = createOptions(url, 'HEAD');
        createAndSendHeadHttpRequest(options, function(err, status){
            return callback(err, status);
        });
        return;
    },
    createBilling: function (id, data, callback) {
        const url = _BillingHost + '/billings';
        const options = createOptions(url, "POST");
        createAndSendHttpPostRequest(options, data, function (err, status, response) {
            return responseHandlerObject(err, status, response, callback);
        });
        return;
    },
    getBilling: function (id, callback) {
        const url = _BillingHost + '/billings/' + id;
        const options = createOptions(url, "GET");
        createAndSendGetHttpRequest(options, function (err, status, response) {
            return responseHandlerObject(err, status, response, callback);
        });
        return;
    },
    revertBilling : function(id, callback){
        const url = _BillingHost + '/billings/' + id;
        const options = createOptions(url, 'DELETE');
        createAndSendDeleteHttpRequest(options, function(err, status, response){
            return responseHandlerObject(err, status, response, callback);
        });
        return;
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



function createOptions(uri, method) {
    let item = {
        method: method,
        uri: uri,
    };
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

function responseHandlerArrayObject(err, status, response, callback) {
    if (err){
        if (err.code == "ECONNREFUSED")
            return callback(err, 503, 'Sorry. Service is not available, please try again later');
        else {
            status = (status || typeof(status) != 'undefined') ? status : 500;
            return callback(err, status, response);
        }
    } else {
        if (status == 200) {
            if (response) {
                const parseObject = JSON.parse(response);
                const array = Array.from(parseObject);
                return callback(err, status, array);
            } else {
                return callback(err, status, null);
            }
        } else {
            if (response){
                return callback(null, status, JSON.parse(response));
            } else {
                return callback(null, status, null);
            }
        }
    }
}