//cards.js

define([
  'model/datamodel'
], function (datamodel){
'use strict'

  let CardsClass = Object.create(datamodel);
  Object.assign(CardsClass,{

    table : 'cards',

    create : function(req){
      const query = this.insertQueryBuilder(req);
      return this.queryDB(query
      ).then(()=>{ let leDer = this.getLastInserted()
      return leDer
    });
    }

  });
  return CardsClass;
});
