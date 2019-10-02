//entity.js

// This function needs clearer purpuse.
// It should be a parent object of work object

define(['data/dbConnector'], function(db, datamodel){
  const attributes = {
    users : {
      strParams : ["first_name","last_name","email","password","api_key"],
      nonStrParams : ["id","is_admin"]
    },
    cards : {
      strParams : ["brand","expired_at","last_4"],
      nonStrParams : ["id", "user_id"]
    },
    wallets : {
      strParams : [],
      nonStrParams : ["user_id"]
    },
    payins : {
      strParams : [],
      nonStrParams : ["wallet_id", "amount"]
    },
    payouts : {
      strParams : [],
      nonStrParams : ["wallet_id", "amount"]
    },
    transfers : {
      strParams : [],
      nonStrParams : ["debited_wallet_id","credited_wallet_id","amount"]
    }
  }

  function deleteById(table, id, res){
    if ((typeOf(table) === "string" || table instanceof String) && table in attributes){
      let queryDelete = `DELETE FROM ${table} WHERE id=${id}`;
      return queryDB(queryDelete, res);
    }
    console.error("Bad table : "+table);
  }

  /**
  * Returns a Promise to execute the query
  * query : the string query to execute
  */
  let queryDB = function (query){
    return new Promise( function(resolve,reject){
      console.log(query)
      db.query(query, function(err, result, fields) {
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
  };

  return {
    getAll : function(){
      let query = `SELECT * FROM ${this.table}`;
      return queryDB(query);
    },
        queryDB : queryDB,

    /**
      * Create an INSERT query
      */
    insertQueryBuilder : function (table, req){
        let queryParams = `INSERT INTO ${table} (`;
        let queryValues = "VALUES (";

        for (let params of [attributes[table].strParams, attributes[table].nonStrParams]) {
          for (let param of params){

            if (req.body.hasOwnProperty(param)){
              queryParams +=(param+",");

              // If it's a non-string parameter, no quote !
              if(attributes[table].strParams.includes(param))
                queryValues += `'${req.body[param]}',`;
              else if (attributes[table].nonStrParams.includes(param))
                queryValues += `${req.body[param]},`;

            }
            else if(param != "id") {
              //res.send("Error, missing parameter in request body");
              throw new Error("Missing parameter in request body : " + JSON.stringify(req.body));
              return;
            }
          }
        }
        queryParams = queryParams.slice(0, -1) + ") ";
        queryValues = queryValues.slice(0, -1) + ") ";

        //console.log(queryParams+queryValues);
        return queryParams+queryValues;
      },

      /**
      * Create an UPDATE query for the item type (table) specified
      */
      updateQueryBuilder : function(table, id, changedAttribute, value){
        let queryParam = `UPDATE ${table} SET `;
        let queryCondition = ` WHERE id=${id}`;

            if (attributes[table].nonStrParams.includes(changedAttribute)){
              queryParam += (changedAttribute+"="+value);
            } else if (attributes[table].strParams.includes(changedAttribute)) {
              queryParam += (changedAttribute+"="+`'${value}'`);
            } else console.error("Unexpected parameter");

            return queryParam+queryCondition;
      }
  }
});
