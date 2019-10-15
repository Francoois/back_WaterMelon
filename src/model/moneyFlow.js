//moneyFlow.js

define([
  'model/datamodel'
], function (datamodel){
  'use strict'

  let MoneyFlow = Object.create(datamodel);
  Object.assign(MoneyFlow,{
    getAmountByWalletID : function(walletId){
      return datamodel.queryDB(`SELECT * FROM ${this.table} WHERE wallet_id=${walletId}`)
      .then(
        (queryResult) => {
          let amount = 0;
          for (let line of queryResult){
            amount += line.amount
          }
          return Promise.resolve(amount);

        },
        () => { console.error("Error fetching "+this.table); }
      );
    }
  });
  return MoneyFlow;
});
