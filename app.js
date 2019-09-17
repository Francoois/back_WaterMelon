const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

// Password encryption https://github.com/kelektiv/node.bcrypt.js#readme
const bcrypt = require('bcrypt');


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

let db = mysql.createConnection({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "watermelon",
  port: "3306"
});

//////// Users route
app.get('/users', function(req, res) {
  let query = `SELECT * FROM users`;
  queryDB(query, res);
});
app.post('/users', function(req, res) {
  const query = _insertQueryBuilder("users", req);
  queryDB(query, res);
});

app.get('/users/:id(\\d+)', function(req, res){
  const query = `SELECT * FROM users WHERE  id=${req.params.id}`;
  queryDB(query,res);
});
app.put('/users/:id(\\d+)', function(req, res){
  const query = _updateQueryBuilder("users",req);
  queryDB(query,res);
});
app.delete('/users/:id(\\d+)', function(req, res){
  let id = req.params.id;
  let query = `DELETE FROM users WHERE id=${id}`;
  queryDB(query,res);
});

///////////////////////// Cards Route
app.get('/cards', function(req, res) {
  let query = `SELECT * FROM cards`;
  queryDB(query, res);
});
app.get('/cards/:id(\\d+)', function(req, res) {
  let query = `SELECT * FROM cards WHERE id=${req.params.id}`;
  queryDB(query, res);
});
app.post('/cards', function(req,res){
  const query = _insertQueryBuilder("cards", req);
  queryDB(query, res);
});
app.put('/users/:id(\\d+)', function(req,res){
  const query = _updateQueryBuilder("cards");
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

app.listen(8000, function(){
  db.connect(function(err){
    if (err) throw err;
    console.log('Connection to database successful!');
  });
  console.log('Example app listening on port 3000!');
});

// TODO : remove parameters from sendReq with appropriate `this` trick
function queryDB(query,res){
  console.log(query)
  db.query(query, function(err, result, fields) {
    if (err) throw err;
    res.send(JSON.stringify(result));
  });
}

/**
* Create an INSERT query
*/
function _insertQueryBuilder(table, req){
  let queryParams = `INSERT INTO ${table} (`;
  let queryValues = "VALUES (";

  for (let params of [attributes[table].strParams, attributes[table].nonStrParams]) {
    for (let param of params){

      if (req.body.hasOwnProperty(param)){
        queryParams +=(param+",");

        // If it's a non-string parameter, no quote !
        if(attributes[table].strParams.includes(param))
          queryValues += `'${req.body[param]}',`;
        else if (attributes[table].nonStrParams.includes(param))
          queryValues += `${req.body[param]},`;

      }
      else if(param != "id") {
        //res.send("Error, missing parameter in request body");
        throw new Error("Missing parameter in request body");
        return;
      }
    }
  }
  queryParams = queryParams.slice(0, -1) + ") ";
  queryValues = queryValues.slice(0, -1) + ") ";

  console.log(queryParams+queryValues);
  return queryParams+queryValues;
}

/**
* Create an UPDATE query
*/
function _updateQueryBuilder(table, req){
  let queryParam = `UPDATE ${table} SET `;
  let queryCondition = ` WHERE id=${req.params.id}`;
  let changedAttribute = req.body.attribute;
  let value = req.body.value;

      if (attributes[table].nonStrParams.includes(changedAttribute)){
        queryParam += (changedAttribute+"="+value);
      } else if (attributes[table].strParams.includes(changedAttribute)) {
        queryParam += (changedAttribute+"="+`'${value}'`);
      } else console.error("Unexpected parameter");

      return queryParam+queryCondition;
}

const attributes = {
  users : {
    strParams : ["first_name","last_name","email","password","api_key"],
    nonStrParams : ["id","is_admin"]
  },
  cards : {
    strParams : ["brand","expired_at","last_4"],
    nonStrParams : ["id", "user_id"]
  },
  wallets : {
    strParams : [],
    nonStrParams : ["user_id"]
  },
  payins : {
    strParams : [],
    nonStrParams : ["wallet_id", "amount"]
  },
  payouts : {
    strParams : [],
    nonStrParams : ["wallet_id", "amount"]
  },
  transfers : {
    strParams : [],
    nonStrParams : ["debited_wallet_id","credited_wallet_id","amount"]
  }
}
