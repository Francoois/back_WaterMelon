//wallets.js

define([
  'data/dbConnector',
  'model/datamodel'
], function (db, dm){
  'use strict'

  let WalletsClass = Object.create(dm);

  Object.assign(WalletsClass,{
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
    getById : function(walletId){
      let queryPayins = `SELECT amount FROM payins WHERE id=${id}`;
      let queryPayouts = `SELECT amount FROM payouts WHERE id=${id}`;
    }

  });

  return WalletsClass;



});
