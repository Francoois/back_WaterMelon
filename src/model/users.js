//users.js

define(['data/dbConnector',
'model/datamodel',
'model/wallets'
], function(db, datamodel, wallets){

  /*let datamodel = require(`./datamodel.js`);
  let db = require('../src/data/dbConnector.js');
  let wallets = require('./wallets');*/

  const table = 'users';

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
  let UserClass = Object.create(datamodel);

  Object.assign(UserClass,
    {
      table : table,
      create : function(req){
        const query = this.insertQueryBuilder("users", req);

        return this.queryDB(query
        ).then(
          ()=>{return _getUserIdFromMail(req.body.email)},
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
        return this.queryDB(query);
      },
      update : function(id, attribute, value){
        const query = updateQueryBuilder(table, id, attribute, value);
        return this.queryDB(query);
      },
      deleteById : function(id){
        let query = `DELETE FROM users WHERE id=${id}`;
        let queryWallet = `DELETE FROM wallets WHERE user_id=${id}`;

        return this.queryDB(queryWallet).then(
          ()=>{return this.queryDB(query);},
          ()=>{console.error("DELETE : delete user failed");}
        );
      }
    });
  return UserClass;

});
