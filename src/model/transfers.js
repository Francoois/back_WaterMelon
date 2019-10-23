//transfers.js

define([
  'model/datamodel',
  'model/payins',
  'model/payouts'
], function (
  model, payins, payouts
){
  'use strict'

  //TODO : check balance before transfer

  let Transfers = Object.create(model);
  Object.assign(Transfers,{

    table : 'transfers',

    getByCreditedWalletId : function(wID){
      console.log("INSIDE getCRED");
      return this.queryDB(
        `SELECT * FROM ${this.table} WHERE credited_wallet_id=${wID}`
      );
    },

    getByDebitedWalletId : function(wID){
      console.log("INSIDE getDEB");
      return this.queryDB(
        `SELECT * FROM ${this.table} WHERE debited_wallet_id=${wID}`
      );
    },
    /*,

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
    }*//*,
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
    }*/
    deleteByWalletID : function(wallet_id){

      return this.queryDB(
        `DELETE FROM transfers WHERE credited_wallet_id=${wallet_id}`
      ).then(
        ()=>{ return this.queryDB(
          `DELETE FROM transfers WHERE debited_wallet_id=${wallet_id}`
        );}
      ).catch(
        (code)=>{ return code || 500 ;}
      )
    }

  });
  return Transfers;
});
