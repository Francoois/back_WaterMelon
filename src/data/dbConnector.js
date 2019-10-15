//dbConnector.js
//https://gist.github.com/jasonwyatt/1106973

define(['mysql'], function(mysql){

  let instance = null;

  function MySingleton(){
    if(instance !== null){
        throw new Error("Cannot instantiate more than one MySingleton, use MySingleton.getInstance()");
    }

    this.initialize();
  }
  MySingleton.prototype = {
      initialize: function(){
          this.db = mysql.createConnection({
                host: "localhost",
                user: "admin",
                password: "admin",
                database: "watermelon",
                port: "3306",
                timezone: 'utc'
              });
          this.db.connect(function(err){
            if (err) throw err;
            console.log('Connection to database successful!');
          });
      }
  };
  MySingleton.getInstance = function(){
      // summary:
      //      Gets an instance of the singleton. It is better to use
      if(instance === null){
          instance = new MySingleton();
      }
      return instance;
  };

  return MySingleton.getInstance().db;

});
