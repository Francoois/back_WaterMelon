//users.js

define([
  'bcrypt', // Password encryption https://github.com/kelektiv/node.bcrypt.js#readme
  'util/authenticator',
  'model/datamodel',
  'model/wallets',
  'model/cards'
], function(
  bcrypt, auth,
  datamodel, wallets, cards
){

  let User = Object.create(datamodel);
  Object.assign(User,
    {
      table : 'users',
      create : function(req){

        if (req.body.is_admin === undefined || req.body.is_admin === '')
          req.body.is_admin = false; //FIXME : don't create from req, and is admin always false

        req.body.api_key = 'api_'+req.body.email+Date.now()+Math.floor(Math.random()*1000);

        if(!this.validateEmail(req.body.email)) {
            console.log("Bad Mail");
            return Promise.reject(400);
        }

        return new Promise(function(resolve, reject){
          bcrypt.hash(req.body.password, /*saltRounds*/ 10, function(err, hash) {
            // Store hash in your password DB.
            console.log("hash :",hash);
            req.body.password = hash;
            resolve();
          });
        }).then(
          // Check user not already in DB
          ()=>{ return this.getIdByEmail(req.body.email);}
        ).then(
          (user) => {
            if(user.length!==0) return Promise.reject(400);
            else return this.insertQueryBuilder(req);
          },
          (code)=> {
            if(code === 404) return this.insertQueryBuilder(req);
            else return code || 500 ;}
        ).then(
          //Perform creation
          (query) => {
            return this.queryDB( query );}
        ).then(
          // Fetch newly created user + create its wallet
          (result)=>{
            const user_id = result.insertId;
            const userProm = this.getOne(user_id, /*justCreated*/ true);

            return Promise.all([
              userProm,
              wallets.create(user_id)
            ]);
          }
        ).then(
          // Return new user
          (responses)=>{ return responses[0]; }
        ).catch(
          (code) => {
            console.log("ABORT creating user");
            return code || 500 ;}
        );
      },
      /**
       * id : integer
       */
      getOne : function getOne(id, justCreated){

          let userProm = this.getById(id);
          let walletIdProm = wallets.getByUserId(id);

        return Promise.all([
            userProm,
            walletIdProm
        ]).then(
          (userNWallet)=> {
            const user = userNWallet[0][0];
            user.is_admin = (user.is_admin === 1);

            if(justCreated===true) user.access_token = user.api_key;
            delete user.password;
            delete user.api_key;

            user.wallet_id = userNWallet[1][0].id;

            return Promise.resolve(user);
          },
            (err) => {
              console.log("Get user or wallet failed");
            }
        )
      },

        getAll : function(){
          return datamodel.getAll.call(this).then(
              (userResults) => {

                      const res = userResults.map((user) => {

                          return wallets.getByUserId(user.id).then(
                              (wallet) => {
                                  user.wallet_id = wallet[0].id;
                                  return user;
                              }
                          );
                      });
                      return Promise.all(res);
              }
          )
        },

      /**
      * connect :
      * Returns true if good authentication *token* is provided.
      * False if it's not
      */
      isValidToken : function(token){

        const decoded = auth.readJWT(token);
        if (decoded == undefined) return Promise.reject(401);

        let token_email = decoded.email;

        return this.queryDB(
          `SELECT * FROM users WHERE email='${token_email}'`
        ).then(
          (result) => {return Promise.resolve(!!(result.length > 0));}
        ).catch( () => { return Promise.reject(401)}); //400 : Bad Request
      },

      authenticate : function(email, password){
        if(email == undefined || password == undefined)
        return Promise.reject(400);// * Verifying firewall when missing fields... OK

        return this.queryDB(
          `SELECT * FROM users WHERE email='${email}'`)
          // Check user exists
          .then(
            (result) => {
              if (result.length == 1)return result[0];
              else return Promise.reject(401);
            }
          ).then(
            (user)=>{
              return bcrypt.compare(password, user.password).then(
                (res)=>{
                  if(res==true) return auth.generateJWT(user);
                  else return Promise.reject(401);
                }
              );
            }
          ).catch(
            (code) => {return Promise.reject(code || 401);}
          );
      },
      authenticateWithHash : function(email, hashPassword){
        if(email == undefined || hashPassword == undefined)
        return Promise.reject(400);// * Verifying firewall when missing fields... OK

        return this.queryDB(
          `SELECT * FROM users WHERE email='${email}'`)
          .then(
            (result) => {
              if (result.length !== 1 || result[0].password !== hashPassword)
              return Promise.reject(401);
              else{  return auth.generateJWT(result[0]); }
            }
          ).catch(
            (code) => {return Promise.reject(401);}
          );
      },

      getIdByEmail : function getIdByEmail(email){
        return this.queryDB(`SELECT id FROM users WHERE email='${email}'`)
        .then (
          (result) => {
            if(result.length===0) return Promise.reject(404);
            return parseInt(result[0].id);
          }
        ).catch( (code )=>{
          console.log("ERROR, returned code :",code);
          return Promise.reject(code || 500);
        });
      },

      hasCard : function hasCard(user_id, card_id){

        return cards.getById(card_id).then(
          (result) => {

            if(result.length===1){

              if(result[0].user_id == user_id)
                return true;
              else
                return false;
            }
            else return false;

          }
        ).catch( ()=>{ return 500; } )
      },

      /**
       * Check if user has a Payin
       * Return true or false or Error code
       */
      hasPayin : function hasPayin(user_id, payin_id){

        return wallets.getByUserId(user_id).then(
          (wallet) => {
            return wallets.hasPayin(wallet[0].id,payin_id);
          }
        ).catch ( (code) => { return Promise.reject(code || 500); });
      },

      hasPayout : function hasPayout(user_id, payout_id){
        return wallets.getByUserId(user_id).then(
          (wallet) => {
            return wallets.hasPayout(wallet[0].id,payout_id);
          }
        ).catch ( (code) => { return Promise.reject(code || 500); });
      },

      getByApiKey(api_key){

        return this.queryDB(
          `SELECT * FROM users WHERE api_key='${api_key}'`
        );
      },

      getWallet : function getWallet(user_id){

        return wallets.getByUserId(user_id).then(
          (wallet)=>{
            return wallet[0].id || Promise.reject(500);
          }
        )
      },

      hasTransfer : function(user_id, transfer_id){

        return this.getWallet(user_id).then(
          (walletId)=>{
            return wallets.hasTransfer(walletId, transfer_id);
          }
        );
      },

        update : function(id, putData){

            return new Promise(function(resolve, reject){
                return Promise.resolve(
                    bcrypt.hash(putData.password, /*saltRounds*/ 10, function(err, hash) {
                        // Store hash in your password DB.
                        console.log("hash :",hash);
                        putData.password = hash;
                        resolve();
                    })
                );
            }).then(
                ()=>{
                    return datamodel.update.call(this,id,putData);
                }
            ).catch(
                ()=>{ console.log("ERROR UPDATING USER");}
            );
        },

      validateEmail : function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      }

    });
  return User;

});
