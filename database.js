let mysql = require('mysql');
let db_info = {
    host : 'st230104.cafe24app.com',
    port : '3306',
    user : 'st23010',
    password : 'pnks1!!1',
    database : 'st23010'
}

module.exports = {
    init: function () {
        return mysql.createConnection(db_info);
    },
    connect: function (conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql connection error : ' + err);
            else console.log('mysql is connected successfully!');
        });
    }
}