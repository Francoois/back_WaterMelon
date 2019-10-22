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

  function promCatch(code){
    console.log("User not deleted, returned code :",code);
  }
    const usersToClean = ['good@mail.com','bad@mail.com','wrong','neutral@mail.com'];

    usersToClean.forEach(
      function(element){
        users.getIdByEmail(element)
        .then(
          (userId)=>{
            console.log("DELETE user with mail : ",element);
            users.deleteById(userId);
          }
        )
        .catch ( promCatch );
      }
    );
});
