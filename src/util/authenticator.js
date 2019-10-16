// authenticator.js
/*
 * Authenticator is Singleton to perform file opening only once
 */
define([
  'jsonwebtoken',
  'fs'
], function(
  jwt,
  fs
){

  let instance = null;

  function AuthSingleton(){
    if(instance !== null){
        throw new Error("Cannot instantiate more than one AuthSingleton, use AuthSingleton.getInstance()");
    }

    this.initialize();
  }
  AuthSingleton.prototype = {
      initialize: function(){
        this.secretKey = fs.readFileSync('res/secret.key', 'utf8');
      },

      generateJWT : function(user){
        const token = jwt.sign({
          user_id : user.id,
          email : user.email,
          is_admin : !!(user.is_admin)
        },
        this.secretKey);
        return token;
      },

      readJWT : function(token){
        const decoded = jwt.verify(token, this.secretKey);
        return decoded;
      },

      isAdminToken : function(token){
        return this.readJWT(token).is_admin;
      },

      getTokenUserId : function(token){
        return parseInt(this.readJWT(token).user_id);
      }
  };
  AuthSingleton.getInstance = function(){
      // summary:
      //      Gets an instance of the singleton. It is better to use
      if(instance === null){
          instance = new AuthSingleton();
      }
      return instance;
  };

  return AuthSingleton.getInstance();
});
