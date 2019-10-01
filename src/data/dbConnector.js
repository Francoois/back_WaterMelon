//dbConnector.js

define(['mysql'], function(mysql){

  return mysql.createConnection({
      host: "localhost",
      user: "admin",
      password: "admin",
      database: "watermelon",
      port: "3306"
    });

});
