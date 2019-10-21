define([
  'express',

  'util/authenticator',

  'model/users',
  'model/cards'

], function(
  express,
  auth,
  users, cards ){

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
      ()=>{res.sendStatus(500)}
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

  // TODO ...
  userRouter.get('/wallets/:id(\\d+)', function(req,res){
    const token = req.headers["x-auth-token"];
    const requestId = parseInt(req.query["user_id"]);

    if(_isAuthenticated(req, token)){
      console.log(requestId+" is connected");
      // TODO : handle getByUserId, in upper route, with user_id parameter
      wallets.getByUserId(requestId).then(
        (result)=>{res.status(200).json(result)},
        (code)=>{res.sendStatus(code)}
      );

    } /*else if (_isAdmin(token)) {
      wallets.getBalanceById(req.params.id).then(
        (result)=>{res.status(200).json(result);},
        ()=>{ res.sendStatus(500)}
      );
    }*/
  });

  return userRouter;
});
