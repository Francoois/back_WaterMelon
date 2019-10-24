//cards.js

define([
  'model/datamodel'
], function (datamodel){
'use strict'

  function _dateIsFuture(testDate){

    const now = Date.now();

    const q = new Date(testDate);
    /*var m = q.getMonth();
    var d = q.getDay();
    var y = q.getFullYear();

    const ladate = new Date(y,m,d)
    console.log(ladate);
    console.log(now)*/

    if(q>now)return true;
    else return false;
  }

  let Cards = Object.create(datamodel);
  Object.assign(Cards,{

    table : 'cards',

    create : function(req){
      if(!this.isParamObjectOk(req.body))
        return Promise.reject(400);

      if (!_dateIsFuture(req.body.expired_at)){
        return Promise.reject(400);
      }

      if ( (req.body.last_4.length !== 4) || (parseInt(req.body.last_4) == NaN) )
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
