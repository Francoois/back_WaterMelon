//cards.js

define([
  'model/datamodel'
], function (datamodel){
'use strict'

  let Cards = Object.create(datamodel);
  Object.assign(Cards,{

    table : 'cards',

    create : function(req){
      const query = this.insertQueryBuilder(req);
      return this.queryDB(query
      ).then(()=>{ let leDer = this.getLastInserted();
      return leDer;
    });
    }

  });
  return Cards;
});
