//wallets.js

define([
  'data/dbConnector',
  'model/datamodel'
], function (db, dm){
  'use strict'

  let table = 'wallets'

  return {

    // Wallet is unique : created with users
    create : function(userId){
      let query = dm.insertQueryBuilder(
        table,
      {
        body : {
          user_id : userId
        }
      });
      return dm.queryDB(query);
    }
  }
  // FIXME : Here we cannot send a HTTP response for both user and wallet, we have to choose

});
