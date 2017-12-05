process.env.NODE_ENV = 'development';

var chai        = require('chai'),
    chaiHttp    = require('chai-http'),
    server      = require('./../../app.js'),
    should      = chai.should();

chai.use(chaiHttp);

describe('api cars controller', function(){
    describe('Get cars 0 - 20', function(){
        it('Good request /catalog/', function(done){
            chai.request(server)
            .get('/catalog/?page=0&count=20')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(20);
                done();
            });
        });
    });
    describe('Get cars 0 - 20', function(){
        it('Bad request /catalog/?count=20 (without page)', function(done){
            chai.request(server)
            .get('/catalog/?count=20')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(20);
                done();
            });
        });
    });

    describe('Get cars 0 - 20', function(){
        it('Bad request /catalog/?page=1 (without count)', function(done){
            chai.request(server)
            .get('/catalog/?page=1')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(20);
                done();
            });
        });
    });

    describe('Get cars 0 - 20', function(){
        it('Bad request /catalog/?page=*&count=* with bad parametr page', function(done){
            chai.request(server)
            .get('/catalog/?page=bad_parametr&count=30')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(30);
                done();
            });
        });
    });

    describe('Get cars 0 - 20', function(){
        it('Bad request /catalog/?page=*&count=* with bad parametr count', function(done){
            chai.request(server)
            .get('/catalog/?page=1&count=bad_parametr')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(20);
                done();
            });
        });
    });

    describe('Get cars 0 - 20', function(){
        it('Bad request /catalog/?page=*&count=* with negative count', function(done){
            chai.request(server)
            .get('/catalog/?page=0&count=-20')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(20);
                done();
            });
        });
    });

    describe('Get cars 0 - 20', function(){
        it('Bad request /catalog/?page=*&count=* with negative page', function(done){
            chai.request(server)
            .get('/catalog/?page=-20&count=30')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(30);
                done();
            });
        });
    });

    describe('Get car with id', function(){
        it('Good request /catalog/:id', function(done){
            chai.request(server)
            .get('/catalog/59f634f54929021fa8251633')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
        });
    });

    describe('Get car with id', function(){
        it('Bad request /catalog/:id without id', function(done){
            chai.request(server)
            .get('/catalog/')
            .end(function(err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(20);
                done();
            });
        });
    });

    describe('Get car with id', function(){
        it('Bad request /catalog/:id with undefined id', function(done){
            chai.request(server)
            .get('/catalog/undefined')
            .end(function(err, res) {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.status.should.eql('Error');
                done();
            });
        });
    });
});

describe('live channel ', function(){
    it('Server get Live request', function(done){
        chai.request(server)
        .options('/catalog/live')
        .end(function(err, res) {
            res.should.have.status(200);
            done();
        });
    });
});