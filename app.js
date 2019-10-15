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
  payins, payouts, transfers,
) {

'use strict'

  const app = express(),
  prefix = '/v1',
  port = 8000; //TODO : prefix all routes with v1
  app.use(bodyParser.urlencoded({ extended: true }));

///LOGIN before connection middleware
  app.get(prefix+'/login', function(req, res){});

  //
  app.use(function(req,res,next) {
    if ("x-auth-token" in req.headers) {
      let token = req.headers["x-auth-token"];
      users.connect(token).then(
        (ok) => {
          if(ok) next();
          else res.sendStatus(404);
        }
      )
      .catch(()=>{res.sendStatus(500)});
    }
  });

  //////// Users route
  app.get(prefix+'/users', function(req, res) {
    users.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });

  app.post(prefix+'/users', function(req, res) {
    users.create(req).then(
        (userId)=>{res.status(200).json(userId);}
      ).catch(
        ()=>{
          res.sendStatus(500);
          console.error("Unable to create user's wallet");}
      );
  });

  app.get(prefix+'/users/:id(\\d+)', function(req, res){
    users.getById(req.params.id).then(
      (result)=>{res.status(200).json(result)}
    ).catch(
      ()=>{res.sendStatus(400)}
    );
  });

  app.put(prefix+'/users/:id(\\d+)', function(req, res){
    users.update(
      req.params.id,
      req.body
    ).then(
      ()=>{res.sendStatus(200)}
    ).catch(()=>res.sendStatus(500));
  });

  /**
  * Handles Users AND Wallet DELETE
  */
  app.delete(prefix+'/users/:id(\\d+)', function(req, res){
    users.deleteById(req.params.id).then(
      ()=>{res.sendStatus(200)}
    ).catch(()=>res.sendStatus(500));
  });


  ///////////////////////// Cards Route
  app.get(prefix+'/cards', function(req, res) {
    cards.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  app.get(prefix+'/cards/:id(\\d+)', function(req, res) {
    cards.getById(req.params.id).then(
      (result)=>{res.status(200).json(result)}
    ).catch(
      ()=>{res.sendStatus(400)}
    );
  });
  app.post(prefix+'/cards', function(req,res){
    cards.create(req).then(
        (newId)=>{res.status(200).json(newId);}
      ).catch(
        ()=>{ res.sendStatus(500);}
      );
  });
  app.put(prefix+'/cards/:id(\\d+)', function(req,res){
    cards.update(
      req.params.id,
      req.body
    ).then(
      ()=>{res.sendStatus(200);},
      ()=>{res.sendStatus(500);} );
  });
  app.delete(prefix+'/cards/:id(\\d+)', function(req, res){
    cards.deleteById(req.params.id).then(
      ()=>{res.sendStatus(200);},
      ()=>{res.sendStatus(500);} );
    }
  );

  app.get(prefix+'/payins', function(req, res) {
    payins.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  app.post(prefix+'/payins', function(req, res) {
    payins.create(req).then(
      (newId)=>{res.status(200).json(newId);}
      ).catch(
      ()=>{ res.sendStatus(500);}
      );
  });


  app.get(prefix+'/payouts', function(req, res) {
    payouts.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  app.post(prefix+'/payouts', function(req, res) {
    payouts.create(req).then(
      (newId)=>{res.status(200).json(newId);}
      ).catch(
      ()=>{ res.sendStatus(500);}
      );
  });

  app.get(prefix+'/transfers', function(req, res) {
    transfers.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });

  app.get(prefix+'/transfers/:id(\\d+)', function (req,res){
    transfers.getById(req.params.id).then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  app.post(prefix+'/transfers', function(req, res){
    transfers.create(req).then(
        (newId)=>{res.status(200).json(newId);}
      ).catch(
        ()=>{ res.sendStatus(500);}
      );
  });

  app.get(prefix+'/wallets', function(req, res) {
    //TODO : check if admin
    wallets.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  app.get(prefix+'/wallets/:id(\\d+)', function(req,res){
    wallets.getBalanceById(req.params.id).then(
      (result)=>{res.status(200).json(
        {
          "id" : req.params.id,
          "result" : result
        });
      },
      ()=>{
        res.sendStatus(500)}
    );
  });


/*
DELETE not required by specifications, and not possible yet because transfer not linked to payins/payout once created
  app.delete('/transfers', function (req,res){
    transfers.delete(req.params.id).then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });*/

  app.listen(port, function(){
    db.connect(function(err){
      if (err) throw err;
      console.log('Connection to database successful!');
    });
    console.log("Example app listening on port "+port+"!");
  });

});

// Deadline : 27 Octobre - Dimanche 23h59
// TODO : les bonnes réponses
