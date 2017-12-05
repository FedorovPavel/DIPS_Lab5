var express   = require('express'),
    router    = express.Router(),
    jade      = require('jade');

const views_dir = './app/views/';

const   car     = jade.compileFile(views_dir + 'car_template.jade'),
        err     = jade.compileFile(views_dir + 'error_template.jade'),
        ord     = jade.compileFile(views_dir + 'order_template.jade'),
        draft   = jade.compileFile(views_dir + 'order_draft_template.jade'),
        paid    = jade.compileFile(views_dir + 'order_paid_template.jade');

module.exports = function (app) {
    app.use('/', router);
};

router.get('/', function(req, res, next){
    res.render('index');
});

router.get('/carTemplates',function(req, res, next){
    res.status(200).send(car());
});

router.get('/errorTemplates',function(req, res, next){
    res.status(200).send(err());
});

router.get('/orderTemplate',function(req, res, next){
    res.status(200).send(ord());
});

router.get('/orderTemplate/draft',function(req, res, next){
    res.status(200).send(draft());
});

router.get('/orderTemplate/paid', function(req, res, next){
    res.status(200).send(paid());
});