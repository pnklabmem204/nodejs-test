const express = require('express')
const app = express()
const PORT = 8001
const path = require('path');

const db_config = require(__dirname + '/database.js');
const conn = db_config.init();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    var sql = 'SELECT * FROM place_accessTime WHERE leaveTime IS NULL';
        conn.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.json(results);
            res.end();
            });
    })

