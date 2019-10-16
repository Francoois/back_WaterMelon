const requirejs = require('requirejs');

requirejs.config({
  baseUrl : 'src/',
  nodeRequire: require
});

requirejs([
  'express', //https://expressjs.com/fr/api.html#res https://expressjs.com/fr/guide/using-middleware.html
  'body-parser',
  'bcrypt', // Password encryption https://github.com/kelektiv/node.bcrypt.js#readme

  'data/dbConnector',
  'util/authenticator',

  'model/users',
  'model/cards',
  'model/wallets',
  'model/payins',
  'model/payouts',
  'model/transfers',

  'api/adminRouter',
  'api/userRouter'
],

function(
  express, bodyParser, bcrypt,
  db, auth,
  users, cards, wallets, payins, payouts, transfers,
  adminRouter, userRouter
) {

'use strict'

  const app = express(),
  prefix = '/v1',
  port = 8000;

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use ((rq,rs,next) => { console.log("\nV V V"); next();})

  // LOGIN before connection middleware
  app.post(prefix+'/login', function(req, res){
    const email = req.body.email,
    password = req.body.password;

    users.authenticate(email,password)
    .then(
      (token)=>{res.status(200).json(token)}
    )
    .catch((code)=>{res.sendStatus(code)});
  });

  // JWT - call appropriate router
  app.use(function(req,res,next) {
    const token = req.headers["x-auth-token"];

    if ( ("x-auth-token" in req.headers) && users.isValidToken(token) ){
      if(_isAdmin(req) ){
        console.log("adminRouter");
        app.use(prefix,adminRouter);
        next();
      } else {
        console.log("userRouter");
        app.use(prefix,userRouter);
        next();
      }
    }
    else res.sendStatus(401); // Unauthorized
  });

// FIXME : don't check if authenticated but if user_id param is ok, irrelevant
  function _isAuthenticated(req){
    const token = req.headers["x-auth-token"];
    const id = parseInt(req.query["user_id"]);
    return ( ('user_id' in req.query) && (auth.getTokenUserId(token)===id) ) ? true : false;
  }
  function _isAdmin(req){
    return auth.isAdminToken(req.headers["x-auth-token"])===true;
  }


  app.listen(port, function(){
    console.log("Example app listening on port "+port+"!");
  });

});

// Deadline : 27 Octobre - Dimanche 23h59
// TODO : les bonnes réponses
// TODO Filtres
// TODO pno check
// TODO casse

// #ASK : A quoi sert  le champ api_key ?
