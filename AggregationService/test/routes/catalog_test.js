process.env.NODE_ENV = 'test';

var chai        = require('chai'),
    chaiHttp    = require('chai-http'),
    server      = require('./../../app.js'),
    should      = chai.should();

chai.use(chaiHttp);

describe('Unit test with CatalogService', function(){
    describe('Get cars', function(){
        describe('Good request', function(){
            it('Good request /catalog/cars/*/*', function(done){
                chai.request(server)
                .get('/catalog/cars/0/20')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(20);
                    done();
                });
            });
        });
        describe('Bad request, without page parametr', function(){
            it('Bad request /catalog/cars//* without page', function(done){
                chai.request(server)
                .get('/catalog/cars//20')
                .end(function(err, res) {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
            });
        });
        describe('Bad request, without count parametr', function(){
            it('Bad request /catalog/cars/*/ without count', function(done){
                chai.request(server)
                .get('/catalog/cars/0/')
                .end(function(err, res) {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
            });
        });
        describe('Bad request, with bad page parametr', function(){
            it('Bad request /catalog/cars/:badParam:/*', function(done){
                chai.request(server)
                .get('/catalog/cars/cdasd/20')
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.to.be.a('string');
                    res.text.should.eql('Bad request');
                    done();
                });
            });
        });
        describe('Bad request, with bad count parametr', function(){
            it('Bad request /catalog/cars/*/:badParam:', function(done){
                chai.request(server)
                .get('/catalog/cars/0/asdhasd')
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.type.should.to.be.a('string');
                    res.text.should.eql('Bad request');
                    done();
                });
            });
        });
    });

    describe('Get car by ID', function(){
        describe('Good request', function(){
            it('Good request /catalog/car/*', function(done){
                chai.request(server)
                .get('/catalog/car/59f634f54929021fa8251633')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
            });
        });
        describe('Bad request without id', function(){
            it('Bad request /catalog/car/', function(done){
                chai.request(server)
                .get('/catalog/car/')
                .end(function(err, res) {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
            });
        });
        describe('Bad request: bad id', function(){
            it('Bad request /catalog/car/:badID:', function(done){
                chai.request(server)
                .get('/catalog/car/asdsdg')
                .end(function(err, res) {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    done();
                });
            });
        });
    });
});