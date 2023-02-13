// HTTP 서버(express) 생성 및 구동

// 1. express 객체 생성
const express = require('express')
const app = express()
const PORT = 8001

const db_config = require(__dirname + '/database.js');
const conn = db_config.init();


const HTTPServer = app.listen(PORT, () => {
    console.log(`server started on PORT ${PORT}`)
}) // 변경



// WebSocekt 서버(ws) 생성 및 구동: 서버는 웹 flutter는 클라이언트

// 1. ws 모듈 취득
const wsModule = require('ws');

// 2. WebSocket 서버 생성/구동
const webSocketServer = new wsModule.Server( 
    {
        server: HTTPServer, // WebSocket서버에 연결할 HTTP서버를 지정한다.
        // port: 30002 // WebSocket연결에 사용할 port를 지정한다(생략시, http서버와 동일한 port 공유 사용)
    }
);

// connection(클라이언트 연결) 이벤트 처리
webSocketServer.on('connection', (ws, request)=>{

    // 1) 연결 클라이언트 IP 취득
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    var results2 =''
    console.log(`새로운 클라이언트[${ip}] 접속`);
    
    // 2) 클라이언트에게 메시지 전송
    if(ws.readyState === ws.OPEN){ // 연결 여부 체크
        // ws.send(`클라이언트[${people}] 접속을 환영합니다 from 서버`); // 데이터 전송
    }
    
    // 3) 클라이언트로부터 메시지 수신 이벤트 처리
    ws.on('message', (msg)=>{
        console.log(`클라이언트[${ip}]에게 수신한 메시지 : ${msg}`);
        var temp = msg.toString();
        var keyword = temp.split("|")[0].toString();
        console.log(`입력된 키워드: [${keyword}]`);

        // K1이 입력될 경우 운동기구 이용 시간 테이블에 데이터를 저장한다
        if(keyword=="K1"){
            var member_num = temp.split("|")[1].toString();
            var place_name = temp.split("|")[2].toString();
            var equipment_name = temp.split("|")[3].toString();
            var board_id = temp.split("|")[4].toString();
            var enterTime = temp.split("|")[5].toString();
            var leaveTime = temp.split("|")[6].toString();
            var exerciseTime = temp.split("|")[7].toString();

            var sql= 'INSERT INTO `equipment_accessTime` (member_num, place_name, equipment_name, board_id, enterTime, leaveTime, exerciseTime) VALUES (?, ?, ?, ?, ?, ?, ?)';
            conn.query(sql, [member_num, place_name, equipment_name, board_id, enterTime, leaveTime, exerciseTime], function (error, results, fields) {
                if (error) throw error;
            });
        }// K2가 입력될 경우 운동기구 이용 시간 테이블에서 이용자의 운동 기록 데이터를 가져온다
        else if(keyword=="K2"){            
            var member_num = temp.split("|")[1].toString();

            var sql= 'SELECT enterTime, equipment_name, exerciseTime FROM `equipment_accessTime` WHERE member_num=? ORDER BY enterTime DESC';
            conn.query(sql, [member_num], function (error, results, fields) {
                if (error) throw error;
                // 단순히 results로 전송할 경우 결과의 typedef을 내보내기 때문에
                // JSON.stringify()를 통해 JSON 형태로 변환해야 한다
                ws.send(JSON.stringify(results));
            });
        }        
        // K3가 입력될 경우 체크인으로 실행
        else if(keyword == "K3"){
            var member_num1 = temp.split("|")[1].toString();
            //var enterTime1 = temp.split("|")[2].toString();

            //var sql= 'SELECT * FROM place_accessTime WHERE member_id = ? AND leaveTime IS NULL ORDER BY enterTime DESC';
            // var sql= 'SELECT * FROM place_accessTime WHERE leaveTime IS NULL ORDER BY enterTime DESC';
            var sql= 'SELECT IFNULL(MAX(enterTime), "null") FROM `place_accessTime` WHERE member_num=? AND leaveTime IS NULL ORDER BY enterTime DESC';
            conn.query(sql,[member_num1], function (error, results, fields) {
                //if (error) throw error;
                //res.json(results);
                results2 = results;
                console.log(JSON.stringify(results));
                var temp = JSON.stringify(results).toString();
                var temp2 = temp.split('"data":[')[1].split(']')[0].toString();
                var temp3 = temp2.split(',');
                var temp4;
                for (var i=0; i<temp3.length; i++){
                  temp4+=String.fromCodePoint(temp3[i]);
                }

                ws.send(temp4);

                // // 추후 수정할 내용
                // // 해당 results[0].leaveTime = NULL 이라면 체크인 성공에 대한 메세지를 보낼 예정
                // // results[0].leaveTime에 값이 들어가 있다면 체크아웃 성공에 대한 메세지를 보낼 예정
                // for(var i = 0; i<results.length; i++){
                //     if(results[i].member_id==member_id1){
                //         ws.send(JSON.stringify(results));
                //         i=results.length-1;
                //     }else{
                //         ws.send('체크아웃');
                //     }
                // }
                // // if(results[0].member_id == member_id1){
                // //     if(results[0].leaveTime == null){
                // //         ws.send('체크인성공');
                // //     }else{
                // //         ws.send('체크아웃');
                // //     }
                // // }
            });
        }
        // K4가 입력될 경우 체크아웃으로 실행
        else if(keyword == "K4"){
            var member_num = temp.split("|")[1].toString();

            var sql= 'UPDATE `place_accessTime` SET leaveTime=NOW() WHERE member_num=? AND leaveTime IS NULL';
            conn.query(sql, [member_num], function (error, results, fields) {
                if (error) throw error;
                ws.send(JSON.stringify(results));
            });
        }
        // K5가 입력될 경우 건의사항 등록
        else if(keyword == "K5"){
            var member_num = temp.split("|")[1].toString();
            var detail = temp.split("|")[2].toString();
            var datetime = temp.split("|")[3].toString();

            var sql= 'INSERT INTO `suggestions` (member_num, detail, creation_date) VALUES (?, ?, ?)';
            conn.query(sql, [member_num, detail, datetime], function (error, results, fields) {
                if (error) throw error;
                ws.send(JSON.stringify(results));
            });
        }
        // K6가 입력될 경우 로그인
        else if(keyword == "K6"){
            var member_id = temp.split("|")[1].toString();

            var sql= 'SELECT IFNULL(MAX(member_pw), "null"), IFNULL(MAX(member_num), "null") FROM `member_table` WHERE member_id=?';
            conn.query(sql, [member_id], function (error, results, fields) {
                if (error) throw error;
                ws.send(JSON.stringify(results));
            });
        }
        // K7가 입력될 경우 운동기구 가이드 링크
        else if(keyword == "K7"){
            var place_status = temp.split("|")[1].toString();
            var equipmentname = temp.split("|")[2].toString();

            var sql= 'SELECT guide_url FROM `equipment_guide` WHERE place_status=? AND equipmentname=?';
            conn.query(sql, [place_status, equipmentname], function (error, results, fields) {
                if (error) throw error;
                ws.send(JSON.stringify(results));
            });
        }
        else{
            ws.send('insert가 아닌 다른 문장')}
    })    
    
    // 4) 에러 처리
    ws.on('error', (error)=>{
        console.log(`클라이언트[${ip}] 연결 에러발생 : ${error}`);
    })
    
    // 5) 연결 종료 이벤트 처리
    ws.on('close', ()=>{
        console.log(`클라이언트[${ip}] 웹소켓 연결 종료!!`);
    })
});