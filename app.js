const requirejs = require('requirejs');

requirejs.config({
  baseUrl : 'src/',
  nodeRequire: require
});

requirejs([
  'express', //https://expressjs.com/fr/api.html#res
  'body-parser',
  'bcrypt', // Password encryption https://github.com/kelektiv/node.bcrypt.js#readme
  'data/dbConnector',
  'model/users',
  'model/cards',
  'model/wallets',
  'model/payins',
  'model/payouts',
  'model/transfers'
],

function(
  express, bodyParser, bcrypt, db, users, cards, wallets,
  payins, payouts, transfers
) {

'use strict'

  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));

  //////// Users route
  app.get('/users', function(req, res) {
    users.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });

  app.post('/users', function(req, res) {
    users.create(req).then(
        (userId)=>{res.status(200).json(userId);}
      ).catch(
        ()=>{
          res.sendStatus(500);
          console.error("Unable to create user's wallet");}
      );
  });

  app.get('/users/:id(\\d+)', function(req, res){
    users.getById(req.params.id).then(
      (result)=>{res.status(200).json(result)}
    ).catch(
      ()=>{res.sendStatus(400)}
    );
  });

  app.put('/users/:id(\\d+)', function(req, res){
    users.update(
      req.params.id,
      req.body.attribute,
      req.body.value
    ).then(
      ()=>{res.sendStatus(200)}
    ).catch(()=>res.sendStatus(500));
  });

  /**
  * Handles Users AND Wallet DELETE
  */
  app.delete('/users/:id(\\d+)', function(req, res){
    users.deleteById(req.params.id).then(
      ()=>{res.sendStatus(200)}
    ).catch(()=>res.sendStatus(500));
  });


  ///////////////////////// Cards Route
  app.get('/cards', function(req, res) {
    cards.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  app.get('/cards/:id(\\d+)', function(req, res) {
    cards.getById(req.params.id).then(
      (result)=>{res.status(200).json(result)}
    ).catch(
      ()=>{res.sendStatus(400)}
    );
  });
  app.post('/cards', function(req,res){
    // TODO : get card ID after insert ?
    cards.create(req).then(
        (newId)=>{res.status(200).json(newId);}
      ).catch(
        ()=>{ res.sendStatus(500);}
      );
  });
  app.put('/cards/:id(\\d+)', function(req,res){
    cards.update(
      req.params.id,
      req.body.attribute,
      req.body.value
    ).then(
      ()=>{res.sendStatus(200);},
      ()=>{res.sendStatus(500);} );
  });
  app.delete('/cards/:id(\\d+)', function(req, res){
    cards.deleteById(req.params.id).then(
      ()=>{res.sendStatus(200);},
      ()=>{res.sendStatus(500);} );
    }
  );


  app.get('/wallets', function(req, res) {
    wallets.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });

  app.get('/payins', function(req, res) {
    payins.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });


  app.get('/payouts', function(req, res) {
    payouts.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });

  app.get('/transfers', function(req, res) {
    transfers.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });

  app.get('/transfers/:id(\\d+)', function (req,res){
    transfers.getById(req.params.id).then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  app.post('/transfers', function(req, res){
    transfers.create(req).then(
        (newId)=>{res.status(200).json(newId);}
      ).catch(
        ()=>{ res.sendStatus(500);}
      );
  });
/*
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
