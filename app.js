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
  queryDB(query);

  _getUserIdFromMail(req.body.email).then(
    function(user_id){
    _createWallet(user_id,res);
    },
    function(){
      console.log("Cannot resolve ID from MAIL");
      res.send(500);
    });
});

app.get('/users/:id(\\d+)', function(req, res){
  const query = `SELECT * FROM users WHERE  id=${req.params.id}`;
  queryDB(query,res);
});
app.put('/users/:id(\\d+)', function(req, res){
  const query = _updateQueryBuilder("users",req);
  queryDB(query,res);
});
/**
* Handles Users AND Wallet DELETE
*/
app.delete('/users/:id(\\d+)', function(req, res){
  let id = req.params.id;
  let query = `DELETE FROM users WHERE id=${id}`;
  let queryWallet = `DELETE FROM wallets WHERE user_id=${id}`;

  queryDB(queryWallet);
  queryDB(query, res);
  // XXX : create real dependance and triggers
});

function _getUserIdFromMail(email){
  return new Promise( function(resolve, reject){
    let id = null;
    db.query(
      `SELECT id FROM users WHERE email='${email}'`,
      function (err, result, fields){
        if (err) throw err;
        id=parseInt(result[0].id);

        if(id==null) reject();
        else resolve(id);
      }
    );
  });
}

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
app.put('/cards/:id(\\d+)', function(req,res){
  const query = _updateQueryBuilder("cards",req);
  queryDB(query, res);
});
app.delete('/cards/:id(\\d+)', function(req, res){
  let id = req.params.id;
  let query = `DELETE FROM cards WHERE id=${id}`;
  queryDB(query,res);
});


app.get('/wallets', function(req, res) {
  let query = `SELECT * FROM wallets`;
  queryDB(query,res);
});
// Wallet is unique : created with users
function _createWallet(id,res){
  let query = _insertQueryBuilder("wallets", {
    body : {
      user_id : id
    }
  });
  queryDB(query,res);
}
// #ASK: Create wallet after user, or at the same time with SQL trigger ?
// FIXME : Here we cannot send a HTTP response for both user and wallet, we have to choose

app.get('/payins', function(req, res) {
  let query = `SELECT * FROM payins`;
  queryDB(query, res);
});
function _createPayIn(req,res){
  return new Promise( function (resolve, reject){
    let queryPayin = _insertQueryBuilder("payins",{
      body : {
        wallet_id : req.body.credited_wallet_id,
        amount : req.body.amount
      }
    });
    //let result = queryDB(queryPayin,res);
    db.query(queryPayin,
      function(err, result, fields){
        if (err) throw err;
        //console.log("payin result : "+JSON.stringify(result));
        if(result.affectedRows==1)
          resolve();
        else reject();
      }
    );
    //console.log("result de INSERT payin : "+result);
  });
}

app.get('/payouts', function(req, res) {
  let query = `SELECT * FROM payouts`;
  queryDB(query, res);
});

function _createPayout(req,res){
  let queryPayOut = _insertQueryBuilder("payouts",{
    body : {
      wallet_id : req.body.debited_wallet_id,
      amount : req.body.amount
    }
  });

  return queryDB(queryPayOut,res,true);
  /*let resultProm = queryDB(queryPayOut,false,true);
  resultProm.then(
    (queryResult) => { if(queryResult.affectedRows==1)}
  );*/
  //return new Promise( function (resolve, reject){

    /*db.query(queryPayOut,
      function(err, result, fields){
        if (err) throw err;
        console.log("payout result : "+JSON.stringify(result));
        if(result.affectedRows==1)
          resolve();
        else reject();
      }
    );*//*
    if(result.affectedRows==1){
      console.log("payout resolve");
      resolve();
    }
    else {
      console.log("payout reject");
      reject();
    }
  });*/
}

app.get('/transfers', function(req, res) {
  let query = `SELECT * FROM transfers`;
  queryDB(query, res);
});

app.post('/transfers', function(req, res){
  let queryTransfer = _insertQueryBuilder("transfers", req);
  queryDB(queryTransfer);

  _createPayIn(req).then(
    ()=> {_createPayout(req,res)}
  ).catch(() => { res.sendStatus(500); });
});

app.listen(8000, function(){
  db.connect(function(err){
    if (err) throw err;
    console.log('Connection to database successful!');
  });
  console.log('Example app listening on port 3000!');
});

// TODO : remove parameters from sendReq with appropriate `this` trick
function queryDB(query,res,promised){
  console.log(query)
  let queryResult = null;
  db.query(query, function(err, result, fields) {
    if (err) throw err;
    if(res)
    res.send(JSON.stringify(result));
    queryResult=result;
  });
  if (promised){
    return new Promise( function(resolve,reject){
      if(queryResult==null)
        reject();
      else resolve(queryResult);
    });
  }
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

  //console.log(queryParams+queryValues);
  return queryParams+queryValues;
}

/**
* Create an UPDATE query for the item type (table) specified
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

// TODO : Tests
// TODO : Classes / Modules
// Deadline : 20 Octobre
