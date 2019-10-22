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
  'api/userRouter',
  'api/visitorRouter'
],

function(
  express, bodyParser, bcrypt,
  db, auth,
  users, cards, wallets, payins, payouts, transfers,
  adminRouter, userRouter, visitorRouter
) {

'use strict'

  const app = express(),
  prefix = '/v1',
  port = 8000;

  const debug = true;
  process.countCall = 0;

  app.use(bodyParser.urlencoded({ extended: true }));

  if(debug==true){
    app.use ((req,res,next) => {
      process.countCall++;
      if (process.countCall > 28) process.exit(0);
      console.log('V V V\n');
      console.log(process.countCall);
      next();
    },function(req, res, next) {
        console.log('Request URL:', req.originalUrl, '\t params : ',JSON.stringify(req.params));
        console.log('Request Type:', req.method);
        console.log('Req headers : ',req.headers);
        console.log('body:', req.body);
        next();
      }
    );
  }

  app.use(prefix, visitorRouter);

  // JWT - call appropriate router
  app.use(function(req,res,next) {
    const token = req.headers["x-auth-token"];

    if (token == undefined) {
      res.sendStatus(401);
      return;
    }

    users.isValidToken(token)
    .then(
      (tokenOk)=>{

        if (tokenOk){
          if( auth.isAdminToken(token) ){
            console.log("adminRouter");
            app.use(prefix,adminRouter);
            next();
          } else {
            console.log("userRouter");
            app.use(prefix,userRouter);
            next();
          }
        } else {
          res.status(401).send(token);
        }

      }
    ).catch(
      ()=> {
        res.sendStatus(401); // Unauthorized //* Verifying firewall when missing header... OK
      }
    )
  });

// FIXME : don't check if authenticated but if user_id param is ok, irrelevant
  function _isAuthenticated(req){
    const token = req.headers["x-auth-token"];
    const id = parseInt(req.query["user_id"]);
    return ( ('user_id' in req.query) && (auth.getTokenUserId(token)===id) ) ? true : false;
  }


  app.listen(port, function(){
    console.log("Watermelon listening on port "+port+"!");
  });

});

// Deadline : 27 Octobre - Dimanche 23h59
// TODO : les bonnes réponses
// TODO Filtres
// TODO pno check
// TODO casse

// #ASK : A quoi sert  le champ api_key ?
