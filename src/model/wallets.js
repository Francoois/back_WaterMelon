//wallets.js

define([
  'data/dbConnector',
  'model/datamodel',
  'model/payins',
  'model/payouts',
  'model/transfers'
], function (
  db, model, payins, payouts, transfers
){
  'use strict'

  /**
  *
  */
  function _multirowsSumAmount(queryResult){
      let amount = 0;
      for (let line of queryResult){
        amount += line.amount
      }
      return Promise.resolve(amount);
  }

  let Wallets = Object.create(model);

  Object.assign(Wallets,{
    // Wallet is unique : created with users
    table : 'wallets',
    create : function(userId){
      let query = this.insertQueryBuilder(
      {
        body : {
          user_id : userId
        }
      });
      return this.queryDB(query);
    },

    /**
    * Get a wallet by Id
    * Get all payins and payouts related to this wallet and make the difference
    */
    getBalanceById : function(walletId){

      return new Promise( function(resolve, reject){
        let result = 0,

        pInAmount = payins.getAmountByWalletID(walletId)
        .then(
          (payinsAmount)=>{ result += payinsAmount;}
        ),

        pOutAmount = payouts.getAmountByWalletID(walletId)
        .then(
          (payoutsAmount) => { result -= payoutsAmount;}
        ),

        pInTransfer = transfers.getByCreditedWalletId(walletId)
        .then(_multirowsSumAmount)
        .then((creditedAmount)=>{ result += creditedAmount }),

        pOutTransfer = transfers.getByDebitedWalletId(walletId)
        .then(_multirowsSumAmount)
        .then((debitedAmount)=>{ result -= debitedAmount });

        Promise.all([ pInAmount,pOutAmount,pInTransfer,pOutTransfer ])
         .then( ()=>{resolve(result);} )
         .catch( ()=>{ console.error("Failed fetching amount");});
      }
    );
    }

  });

  return Wallets;
});
