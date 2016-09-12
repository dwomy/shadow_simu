// カード管理
var CB = (function(w, d){
    return{
        pp: 0,
        ep: 0,
        turn_num: 0,
        is_first: false,
        is_deckset: false,
        init_draw_num: 3,   // 最初に用意されてるカード
        first_draw_num: 0,  // 初手に引くカード数
        hands: [],       // 手札
        cards: [],      // カード
        rest_cards: [],      // 残りカード
        // デッキのURLから読込にいく
        // example1: https://shadowverse-portal.com/deckbuilder/create/6?hash=1.6.63dOW.63dOW.63dOW.63fr4.63fr4.63fr4.63gJY.63gJY.61Ldw.63dOC.63dOC.63dOg.63dOg.63dOg.63frE.63frE.5_pzw.5_pzw.5_p-4.5_p-4.5_p-4.5_pFM.63dQ4.63dQ4.63iGi.63ilo.63ilo.61LeE.61LeE.5_pFg.5_pFg.5_pFg.5_rhS.5_rhS.63iH0.63kiy.63kiy.63i_Q.63i_Q.63i_a
        // example2: https://shadowverse-portal.com/deck/1.2.5-Hb2.5-Hb2.5-Hb2.625lm.625lm.625lm.625kC.625kC.625kC.625lc.625lc.625lc.628AI.628AI.628AI.625kq.625kq.625kq.625lI.625lI.625lI.628BE.628BE.5-HbW.5-HbW.5-HbW.5-K1I.5-K1I.5-K1I.61Pni.62D2y.62D2y.62D2y.5-K1S.5-K1S.5-K1S.62D2o.62D2o.62D2o.62BLa#
        getDeck:function(url){
            console.log("getDeck");
            // urlからhashパラメーターを抜き出す
            var hash = null;
            var params = CB.getQueryString(url);
            //console.log(params);

            // hashパラメーターがあれば使い、なければ末尾の文字列を使用する
            if(!params){
                hash = url.split("/").pop();
            } else {
                hash = params.hasOwnProperty('hash') ? params['hash'] : url.split("/").pop();
            }
            var target_url ="./getDeck/" + hash;
            $.get(target_url, {}, function(data){
                var json = JSON.parse(data);
                //console.log(json);
                try{
                    if(json['data']['deck']){
                        CB.setDeck(json['data']['deck']);
                    }
                }catch(e){
                    alert("読込に失敗しました");
                }
            });
        },
        setDeck:function(deck){
            console.log("setDeck");
            // デッキを初期化
            $("#deck").html("");
            CB.cards = [];

            var cards_json = deck['cards'];
            var cards = [];
            // 扱いやすい用加工する
            for(var i = 0; i < cards_json.length; i++){
                var card_info = cards_json[i];

                $("#deck").append("<li>(" + card_info['cost'] + ")" + card_info['card_name'] + "</li>")
                cards.push({name: card_info['card_name'], cost: card_info['cost']});
            }
            if(cards.length == 40){
                $("#deck").show();
                CB.cards = cards;
                CB.is_deckset = true;
                CB.log("デッキをセットしました");
            } else {
                CB.is_deckset = false;
                alert("デッキの読み取りに失敗しました");
            }
        },
        // 初期化して開始
        start: function(){
            if(!CB.is_deckset) {
                CB.log("デッキが読み込まれてない疑惑");
                return false;
            }

            CB.log("----- ゲームを初期化します -----");

            // 初期化
            CB.turn_num = 0;
            CB.rest_cards = CB.cards.concat();  // 値渡し
            CB.hands = [];

            // 先攻後攻の処理
            var is_first = Math.floor(Math.random()*2) === 1 ? true: false;
            CB.log(is_first ? "あなたは先攻です" : "あなたは後攻です");
            if(is_first){
                CB.ep = 2;
                CB.first_draw_num = 1;
            } else {
                CB.ep = 3;
                CB.first_draw_num = 2;
            }
            CB.is_first = is_first;

            // 最初に指定枚数カード引く
            for(var i = 0; i < CB.init_draw_num; i++){
                CB.draw();
            }

            CB.refresh();
        },
        // ターン開始
        turnStart: function(){
            CB.turn_num++;
            // 1ターン目の場合はマリガンチェック
            if(CB.turn_num == 1){
                $("input[name='marigan']:checked").each(function(){
                    // 一旦デッキに戻して引く
                    var idx = $(this).val();
                    var card = CB.hands[idx];
                    CB.hands.splice(idx, 1);
                    CB.rest_cards.push(card);
                    CB.log(card['name'] + " を戻しました。");
                    CB.draw();
                });
                CB.log("===== " + CB.turn_num + "ターン");
                for(var i = 0; i < CB.first_draw_num; i++) CB.draw();
            } else {
                CB.log("===== " + CB.turn_num + "ターン");
                CB.draw();
            }

            CB.refresh();
        },
        // ターン終了
        turnEnd: function(){
            CB.turnStart();
        },
        // ゲームやりなおし
        reset: function(){
            CB.start();
        },
        // カードを使う
        discard: function(idx){
            var str = CB.turn_num + "T: " + CB.hands[idx]['name'] + " をプレイ。";
            $("#used").text(str + "\n" + $("#used").text());
            CB.hands.splice(idx, 1);
            CB.refresh();
        },
        // 画面の更新
        refresh: function(){
            // ツールボックスの更新
            $("#toolbox").html("");
            if(CB.turn_num == 0){
                $("#toolbox").append("<input type='button' value='引き直し指定終了' onClick='CB.turnStart()'>");
            } else {
                $("#toolbox").append("<input type='button' value='次のターンへ' onClick='CB.turnEnd()'>");
                $("#toolbox").append("<input type='button' value='追加ドローする' onClick='CB.draw();CB.refresh();'>");
                $("#toolbox").append("<input type='button' value='最初からやり直す' onClick='CB.reset();'>");
            }

            // ハンドの更新
            $("#hand").html("");
            for(var i = 0; i < CB.hands.length; i++){
                var card = CB.hands[i];
                if(CB.turn_num == 0){
                    // 1ターン目ならマリガン
                    $("#hand").append("<li>"
                        + card['name']
                        + "<br>" + "(" + card['cost'] + ")"
                        + "<br>"
                        + "<input type='checkbox' name='marigan' value='"+i+"'>"
                        + "</li>");
                } else {
                    $("#hand").append("<li>"
                        + card['name']
                        + "<br>" + "(" + card['cost'] + ")"
                        + "<br>"
                        + "<input type='button' name='' value='使う' onClick='CB.discard(" + i + ")'>"
                        + "</li>");
                }
            }

            // 状態
            $("#status").html( (CB.is_first ? "先攻":"後攻"  ) + "/" +CB.turn_num + "ターン目" + "/" +  "残り " + CB.rest_cards.length + "枚");
        },
        // デッキから1枚引く
        draw: function(){
            var idx = Math.floor(Math.random()*CB.rest_cards.length);
            var card = CB.rest_cards[idx];
            // 引いたカードは消しとく
            CB.rest_cards.splice(idx, 1);
            CB.hands.push(card);
            CB.log(card['name'] + " をドローしました。");
        },
        getQueryString: function(url) {
            var idx = url.indexOf("?");
            console.log(idx);
            if (idx !== -1) {
                // 最初の1文字 (?記号) を除いた文字列を取得する
                var query = url.substring(idx+1);
                console.log(query);

                // クエリの区切り記号 (&) で文字列を配列に分割する
                var parameters = query.split('&');

                var result = new Object();
                for (var i = 0; i < parameters.length; i++) {
                    // パラメータ名とパラメータ値に分割する
                    var element = parameters[i].split('=');

                    var paramName = decodeURIComponent(element[0]);
                    var paramValue = decodeURIComponent(element[1]);

                    // パラメータ名をキーとして連想配列に追加する
                    result[paramName] = decodeURIComponent(paramValue);
                }
                return result;
            }
            return null;
        },
        log: function(str){
            $("#message").text(str + "\n" + $("#message").text());
        },
    };
})(window, window.document);