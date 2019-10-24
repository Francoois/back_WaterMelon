//dbConnector.js
//https://gist.github.com/jasonwyatt/1106973

define(['mysql'], function(mysql){

  let instance = null;

  function dbConnectSingleton(){
    if(instance !== null){
        throw new Error("Cannot instantiate more than one dbConnectSingleton, use dbConnectSingleton.getInstance()");
    }

    this.initialize();
  }
  dbConnectSingleton.prototype = {
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
  dbConnectSingleton.getInstance = function(){
      // summary:
      //      Gets an instance of the singleton. It is better to use
      if(instance === null){
          instance = new dbConnectSingleton();
      }
      return instance;
  };

  return dbConnectSingleton.getInstance().db;

});
