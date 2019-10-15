//users.js

define([
  'data/dbConnector',
  'model/datamodel',
  'model/wallets',
  'jsonwebtoken',
  'fs'
], function(db, datamodel, wallets, jwt, fs){

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
  function _getSecretKey(){
    return fs.readFileSync('res/secret.key', 'utf8');
  }
  function _generateJWT(email){
    const token = jwt.sign({ email : email}, _getSecretKey());
    return token;
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
      //FIXME / TODO : duplicated api_key is a fault
      /**
      * connect :
      * Returns true if good authentication *token* is provided.
      * False if it's not
      */
      checkToken : function(token){

        const decoded = jwt.verify(token, _getSecretKey());
        return this.queryDB(
          `SELECT * FROM users WHERE email='${decoded.email}'`
        ).then(
          (result) => {return Promise.resolve(result.length > 0);}
        );

      },

      authenticate : function(email, password){
        return this.queryDB(
          `SELECT * FROM users WHERE email='${email}'`)
          .then(
            (result) => {
              if (result.length !== 1)
              Promise.reject();
              else {
                if ( result[0].password === password){
                  // TODO
                  // create a token
                  // update the token
                  // send the token
                  return _generateJWT(email);

                }
              }
            });
      }
    });
  return UserClass;

});
