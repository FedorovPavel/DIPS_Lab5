process.env.NODE_ENV = 'development';

var chai        = require('chai'),
    chaiHttp    = require('chai-http'),
    server      = require('./../../app.js'),
    should      = chai.should();

chai.use(chaiHttp);

describe('Order-api controller', function(){

    describe('Create order PUT /orders/createOrder', function(){
        describe('Good request', function(){
            var data = {
                userID      : "59f634f54929021fa8251644",
                carID       : "59f634f54929021fa8251648",
                startDate   : "1.11.2017",
                endDate     : "6.11.2017"
            };
            it('Good request', function(done){
                chai.request(server)
                .put('/orders/createOrder')
                .send(data)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.UserID.should.eql(data.userID);
                    res.body.CarID.should.eql(data.carID);
                    res.body.Lease.StartDate.should.eql(new Date(2017,10,1).toISOString());
                    res.body.Lease.EndDate.should.eql(new Date(2017,10,6).toISOString());
                    done();
                });
            });
        });
        describe('Bad request', function(){
            const data = {
                carID       : "59f634f54929021fa8251648",
                startDate   : "1.11.2017",
                endDate     : "6.11.2017"
            };
            it('userID is undefined', function(done){
                chai.request(server)
                .put('/orders/createOrder')
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
                userID      : "59f634f54929021fa8251644",
                startDate   : "1.11.2017",
                endDate     : "6.11.2017"
            };
            it('carID is undefined', function(done){
                chai.request(server)
                .put('/orders/createOrder')
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
                userID      : "59f634f54929021fa8251644",
                carID       : "59f634f54929021fa8251648",
                endDate     : "6.11.2017"
            };
            it('StartDate is undefined', function(done){   
                chai.request(server)
                .put('/orders/createOrder')
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
                userID      : "59f634f54929021fa8251644",
                carID       : "59f634f54929021fa8251648",
                startDate   : "6.11.2017"
            };
            it('EndDate is undefined', function(done){
                chai.request(server)
                .put('/orders/createOrder')
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
                userID      : "59f634f54929021fa8251644",
                carID       : "59f634f54929021fa8251648",
                startDate   : "1.11.2017",
                endDate     : "6.11.2017",
                author      : 'Mocha'
            };
            it('Unknown fields', function(done){
                chai.request(server)
                .put('/orders/createOrder')
                .send(data)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.UserID.should.eql(data.userID);
                    res.body.CarID.should.eql(data.carID);
                    res.body.Lease.StartDate.should.eql(new Date(2017,10,1).toISOString());
                    res.body.Lease.EndDate.should.eql(new Date(2017,10,6).toISOString());
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
                .post('/orders/'+orderID+'/confirm_order')
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
                .post('/orders/'+orderID+'/confirm_order')
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
                .post('/orders/'+orderID+'/confirm_order')
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
                .post('/orders/'+orderID+'/completed_order')
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
                .post('/orders/'+orderID+'/completed_order')
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
                .post('/orders/'+orderID+'/completed_order')
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