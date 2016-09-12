// @file user.js <routes>

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:id', function(req, res){
    var user = {};
    // TODO: findById
    res.send('show user detail: ' + req.params.id);
});

/* CREATE user */
router.post('/create', function(req, res){
    // TODO: insert
    res.send('create user detail');
});

module.exports = router;
