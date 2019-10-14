//transfers.js

define([
  'model/datamodel',
  'model/payins',
  'model/payouts'
], function (
  datamodel, payins, payouts
){
  'use strict'

  let TransfersClass = Object.create(datamodel);
  Object.assign(TransfersClass,{

    table : 'transfers',

    create : function(req){
      const query = this.insertQueryBuilder(req);
      let idInsert = null;

      return this.queryDB(query
      ).then(
        () => {
          return Promise.all([
            payins.create({
              body : {
                wallet_id : req.body.credited_wallet_id,
                amount : req.body.amount
              }
            }),
            payouts.create({
              body : {
                wallet_id : req.body.debited_wallet_id,
                amount : req.body.amount
              }
            })
          ]);
        },() => { console.error("Error creating transfer");}
      ).then(
        () => {
          return this.getLastInserted();
        },
        () => { console.error("Error creating Pay IN/OUT");}
      );
    },

    delete : function(id){
      //TODO check right to delete
      let delPayIProm = _deletePayin(req,res);
      let delPayOProm = _deletePayout(req,res);
      Promise.all([delPayIProm,delPayOProm])
      .then(
        ()=>{ _deleteById("transfers", req.params.id);}
      )
      .then( ()=>{sendOk(res);})
      .catch( ()=>sendError(res));
    }

  });
  return TransfersClass;
});
