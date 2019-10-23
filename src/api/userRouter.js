define([
  'express',

  'util/authenticator',

  'model/users',
  'model/cards',
  'model/wallets',
  'model/payins'

], function(
  express,
  auth,
  users, cards, wallets, payins ){

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
  // No POST for now

  function _getJWTUser(req){
    return auth.getTokenUserId(req.headers["x-auth-token"]);
  }

  userRouter.get('/users/:id(\\d+)', function(req, res){
    const id = parseInt(req.params.id);

    if(thisUserId===id){

      users.getOne(req.params.id).then(
        (result)=>{res.status(200).send(result)}
      ).catch(
        ()=>{res.sendStatus(403)}
      );

    } else res.sendStatus(403); //Forbidden

  });

  userRouter.put('/users/:id(\\d+)', function(req, res){
    users.update(
      req.params.id,
      req.body
    ).then(
      ()=>{res.sendStatus(200)}
    ).catch(()=>res.sendStatus(500));
  });

  userRouter.post('/cards', function(req,res){
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

  userRouter.post('/payins', function(req, res) {
    const user_id = _getJWTUser(req);

    wallets.getByUserId(user_id).then(
      (wallet)=>{
        return wallet[0].id;
      }
    ).then(
      (wallet_id)=>{
        return payins.create(req);
      }
    ).then(
      (insertId) => {
        return payins.getById(insertId);
      }
    ).then(
      (payin) => { res.status(200).send(payin[0]); }
    ).catch (
      (code)=>{ res.sendStatus(code)}
    );

  });


  return userRouter;
});
