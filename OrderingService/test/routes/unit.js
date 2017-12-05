process.env.NODE_ENV = 'development';

var mongoose    = require('mongoose');

var chai        = require('chai'),
    chaiHttp    = require('chai-http'),
    server      = require('./../../app.js'),
    should      = chai.should();

chai.use(chaiHttp);

describe('Get orders GET /orders/getOrders/:id/page/:page/count/:count', function(){
    const userID = '59f634f54929021fa8251644';
    describe('Good request', function(){
        it ('Good requset', function(done){
            chai.request(server)
            .get('/orders/getOrders/'+userID+'/page/0/count/5')
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
            .get('/orders/getOrders/59f634f54929021fa82516/page/0/count/5')
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
            .get('/orders/getOrders/'+userID+'/page/sf/count/5')
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
            .get('/orders/getOrders/'+userID+'/page/0/count/f')
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
    const orderID = '59ff694302f3eb2a4cffd3f7';
    describe('Good request', function(){
        it ('Good requset', function(done){
            chai.request(server)
            .get('/orders/getOrder/'+orderID)
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
            .get('/orders/getOrder/59f634f54929021fa82516')
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