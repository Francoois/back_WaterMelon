define([
  'express',

  'model/users',
  'model/cards'

], function( express, users, cards ){

  const userRouter = express.Router();

  userRouter.get('/users', function(req, res) {
    res.sendStatus(401); // Unauthorized
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
