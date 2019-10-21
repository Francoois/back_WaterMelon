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
        let decoded = null;
        try {
          decoded = jwt.verify(token, this.secretKey);
        }
        catch (error){
          return undefined;
        }
        return decoded;
      },

      isAdminToken : function(token){
        return this.readJWT(token).is_admin;
      },

      getTokenUserId : function(token){
        const decoded = this.readJWT(token);
        if( decoded != undefined && ('user_id' in decoded) && decoded.user_id !== undefined)
          return parseInt(decoded.user_id);
        else return undefined;
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
