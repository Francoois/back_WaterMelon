define([
  'express',

  'model/users',

], function( express, users ){

  const visitorRouter = express.Router();

  // LOGIN before connection middleware
  visitorRouter.post('/login', function(req, res){
    const email = req.body.email,
    password = req.body.password;

    users.authenticate(email,password)
    .then(
      (token)=>{
        console.log("TOKEN :",token);
        res.status(200).send({access_token : token});
      }
    )
    .catch((code)=>{res.sendStatus(code||500)});
  });

  visitorRouter.post('/users', function(req, res) {

    if('is_admin' in req.body) delete req.body.is_admin;

    if(users.isParamObjectOk(req.body)){
      users.create(req).then(
          (userObj)=>{
            console.log("usercreated");
            res.status(200).send(userObj);
          }
        ).catch( (code)=>{ res.sendStatus(code);} );
    } else {
      res.sendStatus(400);
    }

  });
  return visitorRouter;
});
