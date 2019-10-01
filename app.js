const requirejs = require('requirejs');

requirejs.config({
  baseUrl : 'src/',
  nodeRequire: require
});

requirejs([
  'express', //https://expressjs.com/fr/api.html#res
  'body-parser',
  'bcrypt', // Password encryption https://github.com/kelektiv/node.bcrypt.js#readme
  'data/dbConnector'],

function(express, bodyParser, bcrypt, db){

  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));

  //////// Users route
  app.get('/users', function(req, res) {
    let query = `SELECT * FROM users`;
    db.queryDB(query).then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)});
  });
  app.post('/users', function(req, res) {
    users.create(req);
  });

  app.get('/users/:id(\\d+)', function(req, res){
    const query = `SELECT * FROM users WHERE  id=${req.params.id}`;
    db.queryDB(query
    ).then(
      (result)=>{res.status(200).json(result)}
    ).catch(
      ()=>{res.sendStatus(400)}
    );
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

  /*
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

  app.get('/payins', function(req, res) {
    let query = `SELECT * FROM payins`;
    queryDB(query, res);
  });
  function _createPayIn(req,res){
    let queryPayin = _insertQueryBuilder("payins",{
      body : {
        wallet_id : req.body.credited_wallet_id,
        amount : req.body.amount
      }
    });
    return queryDB(queryPayin, res, true);
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
  }

  app.get('/transfers', function(req, res) {
    let query = `SELECT * FROM transfers`;
    queryDB(query, res);
  });
  app.get('/transfers/:id(\\d+)', function (req,res){
    _getTransferById(req.params.id,res);
  });
  app.post('/transfers', function(req, res){
    let queryTransfer = _insertQueryBuilder("transfers", req);
    queryDB(queryTransfer);

    let payInProm=_createPayIn(req);
    let payOutProm=_createPayout(req);

    Promise.all([payInProm, payOutProm])
    .then(
      result => { res.sendStatus(200); })
      .catch(() => { sendError(res); });
  });

  app.delete('/transfers', function (req,res){
    //TODO check right to delete
    let delPayIProm = _deletePayin(req,res);
    let delPayOProm = _deletePayout(req,res);
    Promise.all([delPayIProm,delPayOProm])
    .then(
      ()=>{ _deleteById("transfers", req.params.id);}
    )
    .then( ()=>{sendOk(res);})
    .catch( ()=>sendError(res));
  });
  */
  app.listen(8000, function(){
    db.connect(function(err){
      if (err) throw err;
      console.log('Connection to database successful!');
    });
    console.log('Example app listening on port 3000!');
  });

});

// TODO : Tests
// TODO : Classes / Modules
// Deadline : 20 Octobre
