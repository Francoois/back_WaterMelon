//users.js

define(['data/dbConnector',
'model/datamodel',
'model/wallets'
], function(db, datamodel, wallets){

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
        const query = this.insertQueryBuilder(req);
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
      deleteById : function(id){
        let query = `DELETE FROM ${this.table} WHERE id=${id}`;
        let queryWallet = `DELETE FROM wallets WHERE user_id=${id}`;

        return this.queryDB(queryWallet).then(
          ()=>{return this.queryDB(query);},
          ()=>{console.error("DELETE : delete user failed");}
        );
      }
    });
  return UserClass;

});
