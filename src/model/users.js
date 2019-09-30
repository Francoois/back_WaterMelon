//users.js

let datamodel = require(`./datamodel.js`);
let db = require('../src/data/dbConnector.js');
let wallets = require('./wallets');

function create(){

  const query = datamodel.insertQueryBuilder("users", req);
  db.queryDB(query);
  let userId;
  datamodel.getUserIdFromMail(req.body.email).then(
    (user_id)=>{
      userId = user_id;
      wallets.createWallet(user_id);
    },
    ()=>{console.error("Cannot resolve ID from MAIL");}
  ).then(
      ()=>{res.status(200).json(userId);},
      ()=>{console.error("Unable to create wallet for user "+userId);}
    )
}

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

module.exports = users;
