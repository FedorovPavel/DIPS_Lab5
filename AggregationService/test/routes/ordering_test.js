process.env.NODE_ENV = 'development';

var chai        = require('chai'),
    chaiHttp    = require('chai-http'),
    server      = require('./../../app.js'),
    should      = chai.should();

chai.use(chaiHttp);

describe('Order-api controller', function(){
    const user_id="59f634f54929021fa8251644";
    describe('Create order PUT /orders/:id/createOrder', function(){
        describe('Good request', function(){
            var data = {
                carID       : "59f634f54929021fa8251648",
                startDate   : "1.11.2017",
                endDate     : "6.11.2017"
            };
            it('Good request', function(done){
                chai.request(server)
                .post('/orders/'+user_id+'/createOrder')
                .send(data)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.UserID.should.eql(user_id);
                    res.body.CarID.should.eql(data.carID);
                    res.body.Lease.StartDate.should.eql(new Date(2017,10,1).toISOString());
                    res.body.Lease.EndDate.should.eql(new Date(2017,10,6).toISOString());
                    done();
                });
            });
        });
        describe('Bad request', function(){
            const data = {
                startDate   : "1.11.2017",
                endDate     : "6.11.2017"
            };
            it('carID is undefined', function(done){
                chai.request(server)
                .post('/orders/'+user_id+'/createOrder')
                .send(data)
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.eql('Bad request');
                    done();
                });
            });
        });
        describe('Bad request', function(){
            const data = {
                carID       : "59f634f54929021fa8251648",
                endDate     : "6.11.2017"
            };
            it('StartDate is undefined', function(done){   
                chai.request(server)
                .post('/orders/'+user_id+'/createOrder')
                .send(data)
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.eql('Bad request');
                    done();
                });
            });
        });
        describe('Bad request', function(){
            const data = {
                carID       : "59f634f54929021fa8251648",
                startDate   : "6.11.2017"
            };
            it('EndDate is undefined', function(done){
                chai.request(server)
                .post('/orders/'+user_id+'/createOrder')
                .send(data)
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.eql('Bad request');
                    done();
                });
            });
        });
        describe('Bad request', function(){
            const data = {
                carID       : "59f634f54929021fa8251648",
                startDate   : "1.11.2017",
                endDate     : "6.11.2017",
                author      : 'Mocha'
            };
            it('Unknown fields', function(done){
                chai.request(server)
                .post('/orders/'+user_id+'/createOrder')
                .send(data)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.UserID.should.eql(user_id);
                    res.body.CarID.should.eql(data.carID);
                    res.body.Lease.StartDate.should.eql(new Date(2017,10,1).toISOString());
                    res.body.Lease.EndDate.should.eql(new Date(2017,10,6).toISOString());
                    done();
                });
            });
        });
    });
    describe('Get orders GET /orders/getOrders/:id/page/:page/count/:count', function(){
        describe('Good request', function(){
            it ('Good requset', function(done){
                chai.request(server)
                .get('/orders/getOrders/'+user_id+'/0/5')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(5);
                    done();
                });
            });
        });
        describe('Bad request - bad ID', function(){
            it ('Bad ID', function(done){
                chai.request(server)
                .get('/orders/getOrders/59f634f54929021fa82516/0/5')
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.be.eql('Bad ID');
                    done();
                });
            });
        });
        describe('Bad request - bad page', function(){
            it ('Bad page', function(done){
                chai.request(server)
                .get('/orders/getOrders/'+user_id+'/sf/5')
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.be.eql('Bad request');
                    done();
                });
            });
        });
        describe('Bad request - bad count', function(){
            it ('Bad count', function(done){
                chai.request(server)
                .get('/orders/getOrders/'+user_id+'/0/f')
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.be.eql('Bad request');
                    done();
                });
            });
        });
    });
    describe('Get order GET /orders/getOrder/:id', function(){
        const orderID = '5a00724fdd3f0323e029457c';
        describe('Good request', function(){
            it ('Good requset', function(done){
                chai.request(server)
                .get('/orders/'+user_id+'/getOrder/'+orderID)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
            });
        });
        describe('Bad request - bad ID', function(){
            it ('Bad ID', function(done){
                chai.request(server)
                .get('/orders/'+user_id+'/getOrder/59f634f54929021fa82516')
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.be.eql('Bad ID');
                    done();
                });
            });
        });
    });
    describe('Order paid POST /orders/:id/order_paid', function(){
        describe('Good request', function(){
            const orderID = "59ff6b3121e309280c85499f";
            const data = {
                paySystem   : 'Тинькоф',
                account     : '1234 4444 5566 8989 00',
                cost        : '300'
            }
            it('Good request', function(done){
                chai.request(server)
                .post('/orders/'+orderID+'/order_paid')
                .send(data)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.type.should.be.a('string');
                    res.text.should.eql('Change status succesfully');
                    done();
                });
            });
        });
        describe('Bad request - bad id', function(){
            const orderID = "59ff64e8c90dc32b79a";
            it('bad id', function(done){
                chai.request(server)
                .post('/orders/'+orderID+'/order_paid')
                .send(null)
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.eql('Bad ID');
                    done();
                });
            });
        });
        describe('Bad request status not right', function(){
            const orderID = "5a0072a93fe4850db4e59303";
            it('Bad request', function(done){
                chai.request(server)
                .post('/orders/'+orderID+'/order_paid')
                .send(null)
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.eql("Status don't right");
                    done();
                });
            });
        });
    });
    describe('Confirm order POST /:id/confirm_order', function(){
        describe('Good request', function(){
            const orderID = "59ff6b3121e309280c85499f";
            it('Good request', function(done){
                chai.request(server)
                .post('/orders/'+user_id+'/confirm_order/'+orderID)
                .send(null)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.type.should.be.a('string');
                    res.text.should.eql('Change status succesfully');
                    done();
                });
            });
        });
        describe('Bad request - bad id', function(){
            const orderID = "59ff64e8c90dc32b79a";
            it('bad id', function(done){
                chai.request(server)
                .post('/orders/'+user_id+'/confirm_order/'+orderID)
                .send(null)
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.eql('Bad ID');
                    done();
                });
            });
        });
        describe('Bad request status not right', function(){
            const orderID = "5a0072e23af9aa0d0c50c6e9";
            it('Bad request', function(done){
                chai.request(server)
                .post('/orders/'+user_id+'/confirm_order/'+orderID)
                .send(null)
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.eql("Status don't right");
                    done();
                });
            });
        });
    });
    describe('Completed order POST /orders/:id/completed_order', function(){
        describe('Good request', function(){
            const orderID = "59ff6b3121e309280c85499f";
            it('Good request', function(done){
                chai.request(server)
                .post('/orders/'+user_id+'/completed_order/'+orderID)
                .send(null)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.type.should.be.a('string');
                    res.text.should.eql('Change status succesfully');
                    done();
                });
            });
        });
        describe('Bad request - bad id', function(){
            const orderID = "59ff64e8c90dc32b79a";
            it('bad id', function(done){
                chai.request(server)
                .post('/orders/'+user_id+'/completed_order/'+orderID)
                .send(null)
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.eql('Bad ID');
                    done();
                });
            });
        });
        describe('Bad request status not right', function(){
            const orderID = "5a0073d3fb218c1ff070b638";
            it('Bad request', function(done){
                chai.request(server)
                .post('/orders/'+user_id+'/completed_order/'+orderID)
                .send(null)
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.be.a('string');
                    res.text.should.eql("Status don't right");
                    done();
                });
            });
        });
    });
});