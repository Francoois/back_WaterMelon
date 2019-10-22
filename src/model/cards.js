//cards.js

define([
  'model/datamodel'
], function (datamodel){
'use strict'

  let Cards = Object.create(datamodel);
  Object.assign(Cards,{

    table : 'cards',

    create : function(req){
      if(!this.isParamObjectOk(req))
        return Promise.reject(400);
      const query = this.insertQueryBuilder(req);
      return this.queryDB(query
      ).then((result)=>{

        return this.getById(result.insertId)
        .then (
          (result) => { return Promise.resolve(result[0]);}
        );
      });
    }

  });
  return Cards;
});
