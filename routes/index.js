var express = require('express');
var http = require('https');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'こういうのが欲しい' });
});

router.get('/getDeck/:hash', function(req, res) {
    var api_url = "https://shadowverse-portal.com/api/v1/deck?format=json&lang=ja&hash=" + req.params.hash;
    console.log(api_url);
    http.get(api_url, function(result){
        var data = "";
        result.setEncoding('utf8');

        result.on('data', function(chunk){
            data += chunk;
        });

        result.on('end', function(){
            var ret = JSON.parse(data);
            console.log(ret);
            res.send(JSON.stringify(ret));
        });

    }).on('error', function(e){
        console.log(e.message)
    });
});


module.exports = router;
