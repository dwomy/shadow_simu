// @file wines.js <routes>

var express = require('express');
var client = require('cheerio-httpcli');
var router = express.Router();
var userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3';

/* GET wine listing. */
router.get('/', function(req, res) {
    console.log("wine");
    var cards = [];
    client.fetch(target_url)
    .then(function(result){
        var $ = result.$;
        $('ul[class=deckbuilder-deck-cards-list] > li').each(function(idx){
            var card = {};
            card['name'] = $(this).find('.el-card-list-info-name-text').text();
            card['count'] = $(this).find('.el-card-list-info-count').text().replace('×', '');
            console.log(card);
            res.send(card);
        });
    });
    res.send("test")
});

/* GET  wine detail*/
router.get('/:id', function(req, res){

    res.send([
        {id: req.params.id, name: "wiine", description: "いろいろ"}
    ]);
})

module.exports = router;