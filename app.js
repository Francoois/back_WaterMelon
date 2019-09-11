const express = require('express');
const mysql = require('mysql');

const app = express();

let db = mysql.createConnection({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "watermelon",
  port: "3306"
});

app.get('/users', function(req, res) {
  let query = `SELECT * FROM users`;
  queryDB(query, res);
});
app.post('/users', function(req, res) {
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let password = req.body.password;
  let is_admin = req.body.password;
  let api_key = req.body.api_key;
});
app.get('/cards', function(req, res) {
  let query = `SELECT * FROM cards`;
  queryDB(query, res);
});
app.get('/wallets', function(req, res) {
  let query = `SELECT * FROM wallets`;
  queryDB(query, res);
});
app.get('/payins', function(req, res) {
  let query = `SELECT * FROM payins`;
  queryDB(query, res);
});
app.get('/payouts', function(req, res) {
  let query = `SELECT * FROM payouts`;
  queryDB(query, res);
});
app.get('/transferts', function(req, res) {
  let query = `SELECT * FROM transferts`;
  queryDB(query, res);
});

// TODO : remove parameters from sendReq with appropriate `this` trick
function queryDB(query,res){
  console.log(query)
  db.query(query, function(err, result, fields) {
    if (err) throw err;
    res.send(JSON.stringify(result));
  });
}

app.listen(3000, function(){
  db.connect(function(err){
    if (err) throw err;
    console.log('Connection to database successful!');
  });
  console.log('Example app listening on port 3000!');
});
