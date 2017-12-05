process.env.NODE_ENV = 'development';

var chai        = require('chai'),
    chaiHttp    = require('chai-http'),
    server      = require('./../../app.js'),
    should      = chai.should();

chai.use(chaiHttp);

const user_id="59f634f54929021fa8251644";
describe('Create billing record POST /billings/createBilling', function(){
    const correctDate = {
        paySystem   : "Сбербанк",
        account     : "0000 4444 4444 0000 00",
        cost        : "200"
    }
    it('Good request ', function(done){
        chai.request(server)
        .post('/billings/'+user_id+'/createBilling')
        .send(correctDate)
        .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.PaySystem.should.eql(correctDate.paySystem);
            res.body.Account.should.eql(correctDate.account);
            res.body.Cost.should.eql(parseInt(correctDate.cost));
            done();
        });
    });
    it('Bad request - PaySystem is undefined',function(done){
        let incorrectData = correctDate;
        delete incorrectData.paySystem;
        chai.request(server)
        .post('/billings/'+user_id+'/createBilling')
        .send(correctDate)
        .end(function(err, res) {
            res.should.have.status(400);
            res.type.should.be.a('string');
            res.text.should.eql('Bad request');
            done();
        });
    });
    it('Bad request - account is undefined',function(done){
        let incorrectData = correctDate;
        delete incorrectData.account;
        chai.request(server)
        .post('/billings/'+user_id+'/createBilling')
        .send(correctDate)
        .end(function(err, res) {
            res.should.have.status(400);
            res.type.should.be.a('string');
            res.text.should.eql('Bad request');
            done();
        });
    });
    it('Bad request - Cost is undefined',function(done){
        let incorrectData = correctDate;
        delete incorrectData.cost;
        chai.request(server)
        .post('/billings/'+user_id+'/createBilling')
        .send(correctDate)
        .end(function(err, res) {
            res.should.have.status(400);
            res.type.should.be.a('string');
            res.text.should.eql('Bad request');
            done();
        });
    });
});
describe('get billing record GET /billings/getBilling/:id', function(){
    const correctid = '5a0210a359624c21f0f5678e';
    const correctDate = {
        paySystem   : "Сбербанк",
        account     : "0000 4444 4444 0000 00",
        cost        : "200"
    }
    it('Good request ', function(done){
        chai.request(server)
        .get('/billings/'+user_id+'/getBilling/'+correctid)
        .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.PaySystem.should.eql(correctDate.paySystem);
            res.body.Account.should.eql(correctDate.account);
            res.body.Cost.should.eql(parseInt(correctDate.cost));
            done();
        });
    });
    it('Bad request - Bad ID',function(done){
        const incorrect_id = correctid.slice(1,-1);
        chai.request(server)
        .get('/billings/'+user_id+'/getBilling/'+incorrect_id)
        .end(function(err, res) {
            res.should.have.status(400);
            res.type.should.be.eql('text/html');
            done();
        });
    });
    it('Bad request - not existing record',function(done){
        const id = "5a02113fd068a927f0761e12";
        chai.request(server)
        .get('/billings/'+user_id+'/getBilling/'+id)
        .end(function(err, res) {
            res.should.have.status(404);
            res.type.should.be.a('string');
            res.text.should.eql('Billing not found');
            done();
        });
    });
});