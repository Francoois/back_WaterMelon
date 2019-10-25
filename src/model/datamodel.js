//datamodel.js

define([
  'data/dbConnector',
  'data/dataIndex'
], function(db, attributes){
  'use strict'

  return {

    /**
    * Returns a Promise to execute the query
    * query : the string query to execute
    */
    queryDB : function (query){
      return new Promise( function(resolve,reject){
        console.log(query)
        db.query(query, function(err, result, fields) {
          if (err){
            //throw err
            console.error("\n    ===> WaterMelonDB Error :",err);
            reject(err);
          }else{
            console.log("success");
            resolve(result);
          }
        });
      });
    },
    getAll : function(){
      let query = `SELECT * FROM ${this.table}`;
      return this.queryDB(query);
    },
    /**
     * id : integer
     */
    getById : function(id){
      const query = `SELECT * FROM ${this.table} WHERE  id=${id}`;

      return this.queryDB(query).then(

        (result)=>{
          if (result.length===0){
            console.log("NO RESULT : rejected in promise with 404");
            return Promise.reject(404);
          }
          else return result;
        }
      ).catch(
        (code)=>{return Promise.reject(code || 400)}
      );
    },
    deleteById : function(id){
      if ((typeof(this.table) === "string" || this.table instanceof String) && this.table in attributes){
        const query = `DELETE FROM ${this.table} WHERE id=${id}`;
        return this.queryDB(query);
      }
    },

    create : function(req){
      //console.log("CREER : "+this.query);
      if (!this.isParamObjectOk(req.body))
      return Promise.reject(400);
      const query = this.insertQueryBuilder(req);
      return this.queryDB(query
      ).then((result)=>{
        return result.insertId;
      });
    },
    //FIXME : stop using req object inherited from single file app
    /**
      * Create an INSERT query
      */
    insertQueryBuilder : function(req){

      //TODO : simplify this mess with isParamObjectOk
      if(this.table == undefined) throw new Error();

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
            else if( (param in attributes[table].optional)
          || (param in attributes[table].notUserDefined) ) {
              //res.send("Error, missing parameter in request body");
              throw new Error("Missing parameter <<"+param+">> in request body : " + JSON.stringify(req.body));
              return;
            }
          }
        }
        queryParams = queryParams.slice(0, -1) + ") ";
        queryValues = queryValues.slice(0, -1) + ") ";

        //console.log(queryParams+queryValues);
        return queryParams+queryValues;
      },

    update : function update(id, putData){
      const query = this.updateQueryBuilder(id, putData);
      return this.queryDB(query).then(
        ()=>{
          return this.getById(id);
        }
      ).catch(()=>{return 400});
    },

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
    },
    getByUserId : function(userId){
      return this.queryDB(
        `SELECT * FROM ${this.table} WHERE user_id=${userId}`
      );
    },

    isParamObjectOk : function isParamObjectOk(paramObj){
      const table = this.table;
      // Check for all model attributes
      for (let params of [attributes[table].strParams, attributes[table].nonStrParams]) {
        for (let param of params){

          let notUserDefined = (attributes[table].notUserDefined.indexOf(param) != -1);
          let isOptional = (attributes[table].optional.indexOf(param) != -1);

          // Is the attribute in parameters ?
          if( paramObj.hasOwnProperty(param) ){
            // Is it forbidden to provide ?
            if(notUserDefined){
              console.log("notok : notUserDefined : ",param);
              return false;
            }
            // Is it authorized not to be here ?
          } else if( isOptional || notUserDefined ) {
            console.log("optional or notUserDefined: ",param);
            continue;
          } else {
            console.log("notok : parameter not found : ",param);
            return false;
          }

        }
      }
      return true;
    },

    deleteByUserId : function deleteByUserId(user_id){
      let query = `DELETE FROM ${this.table} WHERE user_id=${user_id}`;
      return this.queryDB(query);
    },

    exists : function(model_id){
      return this.getById(model_id).then(
        (object)=>{
          return Promise.resolve( (object.length===1) );
        }
      ).catch( (code) => {
        if(code==404) return Promise.resolve(false);
        else return Promise.reject(code || 500) ;})
    },

    hasAnyUpdateParam : function(updateRequest){
      const table = this.table;

      for (let params of [attributes[table].strParams, attributes[table].nonStrParams]) {
        for (let param of params){

          if((param in updateRequest) && (attributes[table].notUserDefined.indexOf(param) === -1) ) return true;

        }
      }
      return false;
    }

  }
});
