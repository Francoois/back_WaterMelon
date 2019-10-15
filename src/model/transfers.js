//transfers.js

define([
  'model/datamodel',
  'model/payins',
  'model/payouts'
], function (
  datamodel, payins, payouts
){
  'use strict'

  //TODO : check balance before transfer

  let Transfers = Object.create(datamodel);
  Object.assign(Transfers,{

    table : 'transfers',

    getByCreditedWalletId : function(wID){
      console.log("INSIDE getCRED");
      return datamodel.queryDB(
        `SELECT * FROM ${this.table} WHERE credited_wallet_id=${wID}`
      );
    },

    getByDebitedWalletId : function(wID){
      console.log("INSIDE getDEB");
      return datamodel.queryDB(
        `SELECT * FROM ${this.table} WHERE debited_wallet_id=${wID}`
      );
    }
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
    }*/,

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
  return Transfers;
});
