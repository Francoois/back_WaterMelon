//transfers.js

define([
  'model/datamodel'
], function (
  model
){
  'use strict'

  //TODO : check balance before transfer

  let Transfers = Object.create(model);
  Object.assign(Transfers,
    {

    table : 'transfers',

    /*create : function(req){

      const amount = req.body.amount;
      const debited_wallet_id = req.body.debited_wallet_id;

      return wallets.hasAmount(debited_wallet_id, amount).then(

        (hasAmount)=>{
          if(hasAmount===true){
            return model.create.call(this, req);
          } else return Promise.reject(403);
        }

      ).catch( (code)=>{ return code || 500 });
    },*/

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
