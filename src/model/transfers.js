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

    getByWalletID : function(wID){
      console.log('Get transfers in and out');
      return Promise.all([
        this.getByCreditedWalletId(wID),
        this.getByDebitedWalletId(wID)
      ])
      .then(
        (result)=>{
          let concat = [];

          if(result[0].length>0) {
            result[0].forEach(function(x){
              x.wallet_id = x.credited_wallet_id;
            });
            concat = concat.concat(result[0]);
          }

          if(result[1].length>0) {
            result[1].forEach(function(x){
              x.wallet_id = x.debited_wallet_id;
            });
            concat = concat.concat(result[1]);
          }
          /*console.log('res 0 : ',result[0]);
          console.log('res 1 : ',result[1]);
          console.log('concat :', concat,'the end');*/
          return Promise.resolve(concat);
        }
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
