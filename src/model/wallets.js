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
         .then( ()=>{resolve({
           "wallet_id" : walletId,
           "balance" : result
         });} )
         .catch( ()=>{ console.error("Failed fetching amount");});
      }
    );
  },

  deleteByUserId : function deleteByUserId(userId){

    return this.getByUserId(userId).then(
      (wallet)=>{
        return this.deleteById(wallet[0].id);
      }
    )
  },

  deleteById : function deleteById(id){
    //const prom_delWallet = model.deleteById.call(this, id);
    const prom_delPayins = payins.deleteByWalletID(id);

    return Promise.all([
      prom_delPayins
    ]).then(
      ()=>{ return model.deleteById.call(this, id);}
    ).catch(
      ()=> { return 500;}
    )

  }

  });

  return Wallets;
});
