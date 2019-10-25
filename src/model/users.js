//users.js

define([
  'data/dbConnector',
  'util/authenticator',
  'model/datamodel',
  'model/wallets',
  'model/cards'
], function(
  db, auth, datamodel, wallets, cards
){

  let User = Object.create(datamodel);
  Object.assign(User,
    {
      table : 'users',
      create : function(req){

        if (req.body.is_admin == undefined)
          req.body.is_admin = false; //FIXME : don't create from req, and is admin always false
        req.body.api_key = 'api_'+req.body.email+Date.now()+Math.floor(Math.random()*1000);

        if(!this.validateEmail(req.body.email)) return Promise.reject(400);

        return this.getIdByEmail(req.body.email).then(
          (user) => {
            if(user.length!==0) return Promise.reject(400);
            else return this.insertQueryBuilder(req);
          },
          (code)=> {
            if(code === 404) return this.insertQueryBuilder(req);
            else return code || 500 ;}
        ).then(
          (query) => {
            console.log("Query : ",query);
            return this.queryDB( query );}
        ).then(
          (result)=>{
            const user_id = result.insertId;
            const userProm = this.getOne(user_id);

            return Promise.all([
              userProm,
              wallets.create(user_id)
            ]);
          }
        ).then(
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
      getOne : function getOne(id){
        return this.getById(id)
        .then(
          (userResult)=> {
            const user = userResult[0];
            user.is_admin = (user.is_admin === 1);
            user.access_token = user.api_key; //FIXME
            return Promise.resolve(user);
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
          .then(
            (result) => {
              if (result.length !== 1 || result[0].password !== password)
              return Promise.reject(401);
              else{
                  // TODO
                  // create a token
                  // update the token
                  // send the token
                  return auth.generateJWT(result[0]);
                }
            }
          ).catch(
            (code) => {return Promise.reject(401);}
          );
      },

      getIdByEmail : function getIdByEmail(email){
        return this.queryDB(`SELECT id FROM users WHERE email='${email}'`)
        .then (
          (result) => {
            console.log(result);
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

      validateEmail : function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      }

    });
  return User;

});

// #ASK = différence entre api_key et access_token
