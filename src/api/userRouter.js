define([
  'express',

  'util/authenticator',

  'model/users',
  'model/cards',
  'model/wallets',
  'model/payins',
  'model/payouts',
  'model/transfers'

], function(
  express,
  auth,
  users, cards, wallets, payins, payouts, transfers ){

  const userRouter = express.Router();

  /**
   * Connected user : gets only himself
   */
  userRouter.get('/users', function(req, res) {
    //res.sendStatus(200); // Forbidden
    users.getOne(_getJWTUser(req)).then(
      (result)=>{
        res.status(200).send([result]); //* Verifying firewall... OK
      },
      ()=>{res.sendStatus(400)}
    );
  });
  userRouter.delete('/users/:id(\\d+)', function(req, res){
    const user_id = _getJWTUser(req);
    const id = parseInt(req.params.id);

    users.exists(id).then(
      (exists)=>{
        if (exists){
          if(user_id!==id) return Promise.reject (403);

          return users.deleteById(id);
        }
        else return Promise.reject(404);
      }
    ).then(
      ()=>{ res.sendStatus(204); }
    ).catch(
      (code) => { res.sendStatus(code || 500 ); }
    );

  });
  userRouter.get('/users/:id(\\d+)', function(req, res){
    const user_id = _getJWTUser(req);
    const id = parseInt(req.params.id);

    users.exists(id).then(
      (exists)=>{
        if(exists==true){
          return;
        } else return Promise.reject(404);
      }
    ).then(
      ()=>{
        if(user_id===id){
          return users.getOne(req.params.id)
        } else return Promise.reject(403); //Forbidden
      }
    ).then(
      (result)=>{res.status(200).send(result)}
    ).catch(
      (code)=>{res.sendStatus( code || 500 )}
    );

  });
  userRouter.put('/users/:id(\\d+)', function(req, res){
    const user_id = _getJWTUser(req);
    const id = parseInt(req.params.id);

    if( (!users.hasAnyUpdateParam(req.body))
      || (!users.validateEmail(req.body.email))
    ){

      res.status(400).send(); return;
    }

    users.exists(id).then(
      (exists)=> {
        if(exists===true) return Promise.resolve();
        else return Promise.reject(404);
      }
    ).then(
      ()=>{if (user_id !== id) {
        res.status(403).send(); return; // TEST Interaction : put 9999999 is both another user AND does not exist
      }}
    ).then(
      ()=>{ return users.update( req.params.id, req.body ); }
    ).then(
      ()=>{ return users.getOne(id); }
    ).then(
      (user)=>{res.status(200).send(user);}
    ).catch((code)=>{
      console.log("PUT failed, Code : ",code);
      res.sendStatus(code || 500);
    });
  });

  function _getJWTUser(req){
    return auth.getTokenUserId(req.headers["x-auth-token"]);
  }

  userRouter.post('/cards', function(req,res){
    req.body.user_id = _getJWTUser(req);

    cards.create(req).then(
        (newCard)=>{
          console.log('newCard : ',newCard);
          res.status(200).send(newCard);}
      ).catch(
        ()=>{ res.sendStatus(400);}
      );
  });
  userRouter.get('/cards', function(req, res) {
    const user_id = _getJWTUser(req);

    cards.getByUserId(user_id).then(
      (result)=>{res.status(200).send(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  userRouter.get('/cards/:id(\\d+)', function(req, res) {

    const card_id = req.params.id;
    const user_id = _getJWTUser(req);
    users.hasCard(user_id,card_id).then(
      (hasCard) => {
        if(hasCard===true){
          cards.getById(card_id).then(
            (result)=>{
              console.log("RES CARD GET :",result);
              res.status(200).send(result[0])
            }
          ).catch(
            (code)=>{res.sendStatus(code)}
          );
        } else res.sendStatus(404);

      }
    ).catch(
      (code)=>{res.sendStatus(code);}
    );
  });
  userRouter.put('/cards/:id(\\d+)', function(req,res){
    const card_id = req.params.id;
    const user_id = _getJWTUser(req);

    users.hasCard(user_id,card_id).then(
      (hasCard) => {
        if(hasCard === true){

          cards.update(
            card_id,
            req.body
          ).then(
            (newCard)=>{res.status(200).send(newCard[0]);},
            ()=>{res.sendStatus(400);}
          );

        } else {
          res.sendStatus(404);
        }
      }
    ).catch(
      (code)=>{res.sendStatus(code)}
    );
  });
  userRouter.delete('/cards/:id(\\d+)', function(req, res){
    const card_id = req.params.id;
    const user_id = _getJWTUser(req);

    users.hasCard(user_id, card_id).then(
      (hasCard)=>{
        if(hasCard === true){

          cards.deleteById(req.params.id)
          .then(
            (answer)=>{res.status(204).send();},
            ()=>{res.sendStatus(500);}
          );
        } else {
          res.sendStatus(404);
        }
      }
    ).catch(
      (code)=>{res.sendStatus(code)}
    );
  });

  userRouter.get('/wallets', function(req, res) {
    const user_id = _getJWTUser(req);

    wallets.getByUserId(user_id).then(
      (wallet)=>{
        return wallets.getBalanceById(wallet[0].id)
      }
    ).then(
      (balance)=>{
        res.status(200).send([balance]); //* Verifying firewall... OK
      },
      ()=>{res.sendStatus(400)}
    ).catch(
      (code)=>{ res.sendStatus(code)}
    );
  });
  userRouter.get('/wallets/:id(\\d+)', function(req,res){
    const user_id = _getJWTUser(req);
    const wallet_id = req.params.id;

    wallets.getByUserId(user_id).then(
      (wallet)=>{
        console.log('wallet :',wallet);
        console.log('walletid :',wallet_id);
        if(wallet[0].id == wallet_id){
          return wallets.getBalanceById(wallet_id);
        } else return Promise.reject(404);
      }
    ).then(
      (result)=>{res.status(200).send(result);}
    ).catch(
      (code)=>{ res.sendStatus( code || 500); }
    );
  });

  userRouter.post('/payins', function(req, res) {
    const user_id = _getJWTUser(req);

    wallets.getByUserId(user_id).then(
      (wallet)=>{
        return wallet[0].id;
      }
    ).then(
      (wallet_id)=>{ //TODO : wallet_id not needed anymore ?
        return payins.create(req);
      }
    ).then(
      (insertId) => {
        return payins.getById(insertId);
      }
    ).then(
      (payin) => { res.status(200).send(payin[0]); }
    ).catch (
      (code)=>{ res.sendStatus(code || 500 )}
    );

  });
  userRouter.get('/payins', function(req, res){
    const user_id = _getJWTUser(req);

    wallets.getByUserId(user_id).then(
      (wallet)=> {return payins.getByWalletID(wallet[0].id)}
    ).then(
      (payinz)=>{ res.status(200).send(payinz);}
    ).catch(
      (code)=>{res.sendStatus(code||500);}
    )
  });
  userRouter.get('/payins/:id(\\d+)', function(req, res){
    const user_id = _getJWTUser(req);
    const payin_id = req.params.id;

    users.hasPayin(user_id, payin_id).then(
      (hasPayin)=>{
        if(hasPayin===true){
          return payins.getById(payin_id).then(
            (payin)=>{
              res.status(200).send(payin[0]);
            }
          )
        } else {
          res.sendStatus(403)
        }
      }
    ).catch((code)=>{res.sendStatus(code || 500);})

  });

  userRouter.post('/payouts', function(req, res) {
    const user_id = _getJWTUser(req);

    wallets.getByUserId(user_id).then(
      (wallet)=>{
        return wallet[0].id;
      }
    ).then(
      (wallet_id)=>{ //TODO : wallet_id not needed anymore ?
        return payouts.create(req);
      }
    ).then(
      (insertId) => {
        return payouts.getById(insertId);
      }
    ).then(
      (payoutz) => { res.status(200).send(payoutz[0]); }
    ).catch (
      (code)=>{ res.sendStatus(code || 500 )}
    );

  });
  userRouter.get('/payouts', function(req, res){
    const user_id = _getJWTUser(req);

    wallets.getByUserId(user_id).then(
      (wallet)=> {return payouts.getByWalletID(wallet[0].id)}
    ).then(
      (payoutz)=>{ res.status(200).send(payoutz);}
    ).catch(
      (code)=>{res.sendStatus(code||500);}
    )
  });
  userRouter.get('/payouts/:id(\\d+)', function(req, res){
    const user_id = _getJWTUser(req);
    const payout_id = req.params.id;

    users.hasPayout(user_id, payout_id).then(
      (hasPayout)=>{
        if(hasPayout===true){
          return payouts.getById(payout_id).then(
            (payout)=>{
              res.status(200).send(payout[0]);
            }
          )
        } else {
          res.sendStatus(403)
        }
      }
    ).catch((code)=>{res.sendStatus(code || 500);})

  });
// FIXME : UPDATE & DELETE routes do not exist, test is OK with 404

  userRouter.post('/transfers', function(req, res){
    const user_id = _getJWTUser(req);
    const destWallet_id = req.body.credited_wallet_id;
    const amount = req.body.amount;

    if( !Number.isInteger(parseFloat(amount)) || amount.includes('.') ){
      console.log("BAD AMOUNT !!!"+( !Number.isInteger(parseFloat(amount)))+(amount.includes('.') !==-1));
      res.status(400).send();
      return;
    }
    wallets.exists(destWallet_id).then(
      (exists)=>{
        if (exists===true) {
          return wallets.getByUserId(user_id);
        }
        else {
          console.log(user_id+" DOES NOT EXIST");
          return Promise.reject(400);}
      }
    ).then(
      (wallet)=>{
        const debited_wallet_id = wallet[0].id;
        req.body.debited_wallet_id = debited_wallet_id;
        if (debited_wallet_id == destWallet_id){
          console.log('transfer to one self forbidden');
          return Promise.reject(400);
        }
        return wallets.hasAmount(debited_wallet_id, amount);
      }
    ).then(
      (hasAmount)=>{
        if(hasAmount==true){
          return Promise.resolve();
        } else return Promise.reject(400);
      }
    ).then(
      () => {return transfers.create(req);}
    ).then(
      (newId)=>{ return transfers.getById(newId); }
    ).then(
      (transfer)=>{
        transfer[0].wallet_id = transfer[0].credited_wallet_id;
        res.status(200).send(transfer[0]);}
    ).catch(
      ( code )=>{ res.sendStatus( code || 500 ); }
    );

  });
  userRouter.get('/transfers', function(req, res) {
    const user_id = _getJWTUser(req);

    wallets.getByUserId(user_id).then(
      (wallet)=>{
        console.log('wallet :',wallet);
        return transfers.getByWalletID(wallet[0].id);
      }
    ).then(
      (concat)=>{
        res.status(200).send(concat)},
      ()=>{res.sendStatus(500)}
    ).catch(
      ( code )=>{ res.sendStatus( code || 500 ); }
    );
  });
  userRouter.get('/transfers/:id(\\d+)', function(req, res){
    const user_id = _getJWTUser(req);
    const transfer_id = req.params.id;

    users.hasTransfer(user_id, transfer_id).then(
      (hasTransfer)=> {
        if(hasTransfer===true){
          return transfers.getById(req.params.id)
        }else return Promise.reject(403);
      }
    ).then(
      (result)=>{res.status(200).json(result[0])}
    ).catch(
      (code )=>{res.sendStatus(code || 500);}
    );
  });

  return userRouter;
});
