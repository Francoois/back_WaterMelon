//users.js

define([
  'data/dbConnector',
  'util/authenticator',
  'model/datamodel',
  'model/wallets'
], function(
  db, auth, datamodel, wallets
){

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
      },

      /**
      * connect :
      * Returns true if good authentication *token* is provided.
      * False if it's not
      */
      isValidToken : function(token){
        return this.queryDB(
          `SELECT * FROM users WHERE email='${auth.readJWT(token).email}'`
        ).then(
          (result) => {return Promise.resolve(result.length > 0);}
        ).catch( () => { return Promise.reject(400)}); //400 : Bad Request
      },

      authenticate : function(email, password){
        return this.queryDB(
          `SELECT * FROM users WHERE email='${email}'`)
          .then(
            (result) => {
              if (result.length !== 1 || result[0].password !== password)
              return Promise.reject(404);
              else{
                  // TODO
                  // create a token
                  // update the token
                  // send the token
                  return auth.generateJWT(result[0]);
                }
            });
      }

    });
  return UserClass;

});
