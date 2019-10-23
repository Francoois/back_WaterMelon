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
    const prom_delPayouts = payouts.deleteByWalletID(id);
    const prom_delTransfers = transfers.deleteByWalletID(id);

    return Promise.all([
      prom_delPayins,
      prom_delPayouts,
      prom_delTransfers
    ]).then(
      ()=>{ return model.deleteById.call(this, id);}
    ).catch(
      ()=> { return 500;}
    )

  },

  hasPayin : function hasPayin(wallet_id, payin_id){

    return payins.getById(payin_id).then(
      (payin)=>{
        //if (payin.lenght===0) return Promise.reject(404); //Handled by getById

        if(payin[0].wallet_id === wallet_id)
        return true;
        else return false;
      }
    ).catch((code)=> { return Promise.reject(code || 500); });
  },

  hasPayout : function hasPayout(wallet_id, payout_id){

    return payouts.getById(payout_id).then(
      (payout)=>{
        //if (payin.lenght===0) return Promise.reject(404); //Handled by getById

        if(payout[0].wallet_id === wallet_id)
        return true;
        else return false;
      }
    ).catch((code)=> { return Promise.reject(code || 500); });
  },

  hasAmount : function hasAmount(wallet_id, amount){

    return this.getBalanceById(wallet_id).then(
      (balance)=>{
        return Promise.resolve(balance.balance > amount);
      }
    ).catch( (code)=>{ return code || 500 ;});
  }

  });

  return Wallets;
});
