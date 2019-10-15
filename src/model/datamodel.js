//entity.js

// This function needs clearer purpuse.
// It should be a parent object of work object

define(['data/dbConnector'], function(db, datamodel){
  'use strict'

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
          console.error("\n    ===> WaterMelonDB Error :" + err);
          reject();
        }else{
          console.log("success");
          resolve(result);
        }
      });
    });
  },
  getAll = function(){
    let query = `SELECT * FROM ${this.table}`;
    return queryDB(query);
  },
  update = function(id, putData){
    const query = this.updateQueryBuilder(id, putData);
    return this.queryDB(query);
  },
  getById = function(id){
    const query = `SELECT * FROM ${this.table} WHERE  id=${id}`;
    return this.queryDB(query);
  },
  deleteById = function(id){
    if ((typeof(this.table) === "string" || this.table instanceof String) && this.table in attributes){
      const query = `DELETE FROM ${this.table} WHERE id=${id}`;
      return this.queryDB(query);
    }
  },
  _getLastInserted = function(){
    let table = this.table;//FIXME : cannot keep this in Promise
    return new Promise( function(resolve, reject){
      let query = `SELECT MAX(id) as id FROM ${table}`;
      queryDB(query
      ).then(
        (result)=>{
          resolve(result[0].id);}
      ).catch( ()=> {console.error(`DB: Couldn't get last id in table ${table}`);});
    });
  },
  _create = function(req){
    //console.log("CREER : "+this.query);

    const query = this.insertQueryBuilder(req);
    return this.queryDB(query
    ).then(()=>{ let leDer = this.getLastInserted()
      return leDer;
    });
  };
  //FIXME : stop using req object inherited from single file app
  /**
    * Create an INSERT query
    */
  let insertQueryBuilder = function(req){
    if(this.table ==undefined) throw new Error();

    let table = this.table;

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
    };

  return {

    create : _create,

    getAll : getAll,

    queryDB : queryDB,

    update : update,

    getById : getById,

    getLastInserted : _getLastInserted,

    deleteById : deleteById,

    insertQueryBuilder : insertQueryBuilder,

      /**
      * Create an UPDATE query for the item type (table) specified
      */
      updateQueryBuilder : function(id, putData){
        let table = this.table;
        if(table == undefined || ("id" in putData)) throw new Error();

        let queryParam = `UPDATE ${table} SET `;
        let queryCondition = ` WHERE id=${id}`;

        for (let params of [attributes[table].strParams, attributes[table].nonStrParams]) {
          for (let param of params){

            if(putData.hasOwnProperty(param)){

              let value = putData[param];
              if (attributes[this.table].nonStrParams.includes(param)){
                queryParam += (param+"="+value);
              } else if (attributes[this.table].strParams.includes(param)) {
                queryParam += (param+"="+`'${value}'`);
              } else console.error("Unexpected parameter");
              queryParam+=", ";
            }

          }
        }
        queryParam = queryParam.slice(0, -2);
        return queryParam+queryCondition;
      }
  }
});
