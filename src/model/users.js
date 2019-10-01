//users.js

define(['data/dbConnector',
'model/datamodel',
'model/wallets'
], function(db, datamodel, wallets){

  /*let datamodel = require(`./datamodel.js`);
  let db = require('../src/data/dbConnector.js');
  let wallets = require('./wallets');*/

  const table = 'users';

  function getUserIdFromMail(email){
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

  return {
    getAll : function(){
      let query = `SELECT * FROM ${table}`;
      return datamodel.queryDB(query);
    },
    create : function(req){
      const query = datamodel.insertQueryBuilder("users", req);

      return datamodel.queryDB(query
      ).then(
        ()=>{return getUserIdFromMail(req.body.email)},
        ()=>{console.error("Cannot create user from REQUEST");}
      ).then( //FIXME nasty
        (user_id)=>{
          return new Promise(
            function (resolve, reject){
              wallets.create(user_id).then(
                ()=>{resolve(user_id);},
                ()=>{reject()}
              );
            });
        },
        ()=>{console.error("Cannot resolve ID from MAIL");}
      );
    },
    getById : function(id){
      const query = `SELECT * FROM users WHERE  id=${id}`;
      return datamodel.queryDB(query);
    },
    update : function(id, attribute, value){
      const query = updateQueryBuilder(table, id, attribute, value);
      return datamodel.queryDB(query);
    },
    deleteById : function(id){
      let query = `DELETE FROM users WHERE id=${id}`;
      let queryWallet = `DELETE FROM wallets WHERE user_id=${id}`;

      return datamodel.queryDB(queryWallet).then(
        ()=>{return datamodel.queryDB(query);},
        ()=>{console.error("DELETE : delete user failed");}
      );
    }
  }

});
