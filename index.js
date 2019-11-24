const requirejs = require('requirejs');

requirejs.config({
  baseUrl : 'src/',
  nodeRequire: require
});

requirejs([
  'express', //https://expressjs.com/fr/api.html#res https://expressjs.com/fr/guide/using-middleware.html
  'body-parser',
  'cors',

  'data/dbConnector',
  'util/authenticator',

  'model/users',

  'api/adminRouter',
  'api/userRouter',
  'api/visitorRouter'
],

function(
  express, bodyParser, cors,
  db, auth,
  users,
  adminRouter, userRouter, visitorRouter
) {

'use strict';

  const app = express(),
  prefix = '/v1',
  port = 8000;

  app.use(cors());

  const debug = true;
  if (debug) process.countCall = 0;

  app.use(bodyParser.urlencoded({ extended: true }));

  // DEBUG OUTPUT
  if(debug){
    app.use ((req,res,next) => {
      process.countCall++;
      //if (process.countCall > 78) process.exit(0);
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

  // VISITOR Routes
  app.use(prefix, visitorRouter);

  // ACCESS CONTROL
  app.use(
    // api_key access
    function(req,res,next){
    const api_key = req.headers["x-auth-token"];

    if(api_key !== undefined && api_key.includes('api_')){
      users.getByApiKey(api_key).then(
        (userz)=>{

          if (userz.length===1){
            return users.authenticateWithHash(userz[0].email,userz[0].password)
          } else next();
        }
      ).then(
        (jwt) => {
          console.log("Set JWT : ",jwt);
          req.headers["x-auth-token"] = jwt; next(); }
      ).catch(
        (code) => { return code || 500 ;}
      )
    } else next();
  },

  //JWT Authentication
  function(req,res,next) {
    const token = req.headers["x-auth-token"];

    if (token == undefined) {
      res.sendStatus(401);
      return;
    }

    users.isValidToken(token)
    .then(
      (tokenOk)=>{
        // Routing depending on user OR admin
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

  app.listen(port, function(){
    console.log("Watermelon listening on port "+port+"!");
  });

});

// Deadline : 27 Octobre - Dimanche 23h59
// TODO Filtres
// TODO casse
