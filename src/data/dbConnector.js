//dbConnector.js

const mysql = require('mysql');

let connection = mysql.createConnection({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "watermelon",
  port: "3306"
});

// TODO : remove parameters from sendReq with appropriate `this` trick
/**
* Returns a Promise to execute the query
* query : the string query to execute
* res[optional] : response object to send the response with
*
*/
function queryDB(query){
  return new Promise( function(resolve,reject){
    console.log(query)
    connection.query(query, function(err, result, fields) {
      if (err){
        //throw err
        console.error("WaterMelonDB Error :" + err);
        reject();
      }else{
        console.log("success");
        resolve(result);
      }
    });
  });
}

module.exports = {connection, queryDB};
