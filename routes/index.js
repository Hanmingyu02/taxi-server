var express = require('express');
var router = express.Router();

const db = require('../database/db_connect');
const { route } = require('.');

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
    let userPw = req.body.userPW;

    let queryStr = `select * from tb_user where user_id="${userId}" and user_pw="${userPw}"`;
    console.log('login / queryStr =' + queryStr);
    db.query(queryStr, (err, rows, fields) => {
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

router.post('/taxi/register', function (req, res) {
    console.log('resgister / req.body :' + JSON.stringify(req.body));

    let userId = req.body.userId;
    let userPw = req.body.userPw;

    console.log('register / userId = ' + userId, 'userPw = ' + userPw);
    if (!(userId && userPw)) {
        res.json([{ code: 1, message: '아이디 또는 비밀번호가 없습니다' }]);
        return;
    }

    let queryStr = `insert into tb_user values("${userId}","${userPw}","")`;
    console.log('register / queryStr = ' + queryStr);
    db.query(queryStr, function (err, rows, fields) {
        if (!err) {
            console.log('register / rows = ' + JSON.stringify(rows));
            res.json([{ code: 0, message: '회원가입이 완료되었습니다' }]);
        } else {
            console.log('register / err : ' + JSON.stringify(err));
            if (err.code === 'ER_DUP_ENTRY') {
                res.json([{ code: 2, message: '이미 등록된 아이디 입니다.' }]);
            } else {
                res.json([{ code: 3, message: '알 수 없는 오류가 발생하였습니다.', data: err }]);
            }
        }
    });
});

router.post('/taxi/list', function (req, res) {
    console.log('list / req.body' + JSON.stringify(req.body));

    let userId = req.body.userId;
    console.log('list / userId' + userId);

    let queryStr = `select * from tb_call where user_id="${userId}" order by id desc`;
    console.log('list / queryStr = ' + queryStr);
    db.query(queryStr, function (err, rows, fields) {
        if (!err) {
            console.log('list/ rows = ' + JSON.stringify(rows));
            let code = 0;
            res.json([{ code: code, message: '택시 호출 목록 호출 성공', data: rows }]);
        } else {
            console.log('err : ' + err);
            res.json([{ code: 1, message: '알 수 없는 오류가 발생하였습니다.', data: err }]);
        }
    });
});

router.post('/taxi/call', function (req, res) {
    console.log('taxi/call / req.body' + JSON.stringify(req.body));

    let userId = req.body.userId;
    let startAddr = req.body.startAddr;
    let startLat = req.body.startLat;
    let startLng = req.body.startLng;
    let endAddr = req.body.endAddr;
    let endLat = req.body.endLat;
    let endLng = req.body.endLng;

    if (!(userId && startAddr && startLat && startLng && endAddr && endLat && endLng)) {
        // 하나라도 빠졌다면
        res.json([{ code: 1, message: '출발지 또는 도착지 정보가 없습니다.' }]);
        return;
    }

    let queryStr = `insert into tb_call values(NULL, "${userId}"
    ,"${startLat}","${startLng}","${startAddr}"
    ,"${endLat}","${endLng}","${endAddr}","REQ","")`;

    console.log('call / queryStr = ' + queryStr);

    db.query(queryStr, function (err, rows, fields) {
        if (!err) {
            console.log('call / rows = ', JSON.stringify(rows));
            res.json([{ code: 0, message: '택시 호출이 완료되었습니다.' }]);
        } else {
            console.log('call / err : ' + JSON.stringify(err));
            res.json([{ code: 1, message: '택시 호출이 실패했습니다.', data: err }]);
        }
    });
});

router.post('/driver/register', function (req, res) {
    console.log('driver-register / req.body' + JSON.stringify(req.body));

    let userId = req.body.userId;
    let userPw = req.body.userPw;

    console.log('driver-register / userId = ' + userId + userPw);

    if (!(userId && userPw)) {
        res.json([{ code: 1, message: '아이디 또는 비밀번호가 없습니다' }]);
        return;
    }

    let queryStr = `insert into tb_driver values("${userId}","${userPw}","")`;
    console.log('driver-register / queryStr : ' + queryStr);

    db.query(queryStr, function (err, rows, fields) {
        if (!err) {
            console.log('driver-register / rows', JSON.stringify(rows));
            res.json([{ code: 0, message: '회원가입이 완료되었습니다' }]);
        } else {
            console.log('driver-register / err', JSON.stringify(err));
            if (err.code == 'ER_DUP_ENTRY') {
                res.json([{ code: 2, message: '이미 등록된 아이디 입니다' }]);
            } else {
                res.json([{ code: 3, message: '알 수 없는 오류가 발생하였습니다', data: err }]);
            }
        }
    });
});

router.post('/driver/login', function (req, res) {
    console.log('driver-login / req.body', JSON.stringify(req.body));

    let userId = req.body.userId;
    let userPw = req.body.userPw;

    let queryStr = `select * from tb_driver where driver_id="${userId}" and driver_pw="${userPw}"`;
    console.log('driver-login / queryStr :' + queryStr);

    db.query(queryStr, function (err, rows, fields) {
        if (!err) {
            console.log('driver-login / rows = ' + JSON.stringify(rows));
            let len = Object.keys(rows).length;
            console.log('driver-login / len = ' + len);

            let code = len == 0 ? 1 : 0;
            let message = len == 0 ? '아이디 또는 비밀번호가 잘못 입력되었습니다' : '로그인 성공';

            res.json([{ code: code, message: message }]);
        } else {
            console.log('driver-login / err : ' + err);
            res.json([{ code: 1, message: err }]);
        }
    });
});

router.post('/driver/list', function (req, res) {
    console.log('driver-list / req.body', JSON.stringify(req.body));

    let userId = req.body.userId;
    console.log('driver-list / userId = ' + userId);

    let queryStr = `select * from tb_call where driver_id="${userId}" or call_state="REQ" order by id desc`;
    console.log('driver-list / queryStr = ' + queryStr);
    db.query(queryStr, function (err, rows, fields) {
        if (!err) {
            console.log('driver-list / rows' + JSON.stringify(rows));
            let code = 0;
            res.json([{ code: code, message: '택시 호출 목록 호출 성공', data: rows }]);
        } else {
            console.log('driver-list / err' + err);
            res.json([{ code: 1, message: '알 수 없는 오류가 발생하였습니다', data: err }]);
        }
    });
});

router.post('/driver/accept', function (req, res) {
    console.log('driver-accept / req.body' + JSON.stringify(req.body));

    let callId = req.body.callId;
    let driverId = req.body.driverId;

    console.log('driver-accept / callId = ' + callId + 'diverId = ' + driverId);

    if (!(callId && driverId)) {
        res.json([{ code: 1, message: 'callId 또는 driverId가 없습니다' }]);
        return;
    }
    let queryStr = `update tb_call set driver_id="${driverId}", call_state="RES" where id="${callId}"`;
    console.log('driver-accept / queryStr = ' + queryStr);
    db.query(queryStr, function (err, rows, fields) {
        if (!err) {
            console.log('driver-accept / rows' + JSON.stringify(rows));
            if (rows.affectedRows > 0) {
                res.json([{ code: 0, message: '배차가 완료되었습니다' }]);
            } else {
                res.json([{ code: 2, message: '이미 완료되었거나 존재하지 않는 콜 입니다.' }]);
            }
        } else {
            console.log('driver-accept / err' + JSON.stringify(err));
            res.json([{ code: 3, message: '알 수 없는 오류가 발생하였습니다', data: err }]);
        }
    });
});
module.exports = router;
