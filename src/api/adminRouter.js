define([
  'express',

  'model/users',
  'model/cards',
  'model/wallets'

], function( express, users, cards, wallets ){

  const adminRouter = express.Router();

  //////// Users route
  adminRouter.get('/users', function(req, res) {
    users.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });

  adminRouter.post('/users', function(req, res) {
    users.create(req).then(
        (userId)=>{res.status(200).json(userId);}
      ).catch(
        ()=>{
          res.sendStatus(500);
          console.error("Unable to create user's wallet");}
      );
  });

  adminRouter.get('/users/:id(\\d+)', function(req, res){
    users.getById(req.params.id).then(
      (result)=>{res.status(200).json(result)}
    ).catch(
      ()=>{res.sendStatus(400)}
    );
  });

  adminRouter.put('/users/:id(\\d+)', function(req, res){
    users.update(
      req.params.id,
      req.body
    ).then(
      ()=>{res.sendStatus(200)}
    ).catch(()=>res.sendStatus(500));
  });
  /**
  * Handles Users AND Wallet DELETE
  */
  adminRouter.delete('/users/:id(\\d+)', function(req, res){
    users.deleteById(req.params.id).then(
      ()=>{res.sendStatus(200)}
    ).catch(()=>res.sendStatus(500));
  });

  adminRouter.get('/cards', function(req, res) {
    cards.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });

  adminRouter.get('/cards/:id(\\d+)', function(req, res) {
    cards.getById(req.params.id).then(
      (result)=>{res.status(200).json(result)}
    ).catch(
      ()=>{res.sendStatus(400)}
    );
  });
  adminRouter.post('/cards', function(req,res){
    cards.create(req).then(
        (newId)=>{res.status(200).json(newId);}
      ).catch(
        ()=>{ res.sendStatus(500);}
      );
  });
  adminRouter.put('/cards/:id(\\d+)', function(req,res){
    cards.update(
      req.params.id,
      req.body
    ).then(
      ()=>{res.sendStatus(200);},
      ()=>{res.sendStatus(500);} );
  });
  adminRouter.delete('/cards/:id(\\d+)', function(req, res){
    cards.deleteById(req.params.id).then(
      ()=>{res.sendStatus(200);},
      ()=>{res.sendStatus(500);} );
    }
  );

  adminRouter.get('/payins', function(req, res) {
    payins.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  adminRouter.post('/payins', function(req, res) {
    payins.create(req).then(
      (newId)=>{res.status(200).json(newId);}
      ).catch(
      ()=>{ res.sendStatus(500);}
      );
  });

  adminRouter.get('/payouts', function(req, res) {
    payouts.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  adminRouter.post('/payouts', function(req, res) {
    payouts.create(req).then(
      (newId)=>{res.status(200).json(newId);}
      ).catch(
      ()=>{ res.sendStatus(500);}
      );
  });

  adminRouter.get('/transfers', function(req, res) {
    transfers.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  adminRouter.get('/transfers/:id(\\d+)', function (req,res){
    transfers.getById(req.params.id).then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  adminRouter.post('/transfers', function(req, res){
    transfers.create(req).then(
        (newId)=>{res.status(200).json(newId);}
      ).catch(
        ()=>{ res.sendStatus(500);}
      );
  });
  adminRouter.get('/wallets', function(req, res) {
    wallets.getAll().then(
      (result)=>{res.status(200).json(result)},
      ()=>{res.sendStatus(500)}
    );
  });
  adminRouter.get('/wallets/:id(\\d+)', function(req,res){
      wallets.getBalanceById(req.params.id).then(
        (result)=>{res.status(200).json(result);},
        ()=>{ res.sendStatus(500)}
      );
  });


  return adminRouter;
});
