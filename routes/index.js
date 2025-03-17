var express = require('express');
var router = express.Router();

const db = require('../database/db_connect');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/taxi/test', function (req, res, next) {
    db.query(`select * from tb_user`, (err, rows, fields) => {
        if (!err) {
            console.log('test / rows =' + JSON.stringify(rows));
            res.json([{ code: 0, data: rows }]);
        } else {
            console.log('test / err' + err);
            res.json([{ code: 1, data: err }]);
        }
    });
});

router.post('/taxi/login', function (req, res, next) {
    console.log('login / req.body' + JSON.stringify(req.body));

    let userId = req.body.userId;
    let userPW = req.body.userPW;

    let queryStr = `select * from tb_user where user_id="${userId}" and user_pw="${userPW}"`;
    console.log('login / queryStr =' + queryStr);
    db.query(queryStr,(err, rows, fields) => {
        if (!err) {
            console.log('login / rows = ' + JSON.stringify(rows));
            let len = Object.keys(rows).length;
            console.log('login / len = ' + len);
            let code = len == 0 ? 1 : 0;
            let message = len == 0 ? '아이디 또는 비밀번호가 잘못 입력되었습니다.' : '로그인 성공';

            res.json([{ code: code, message: message }]);
        } else {
            console.log('login / err = ' + err);
            res.json([{ code: 1, message: err }]);
        }
    });
});

module.exports = router;
