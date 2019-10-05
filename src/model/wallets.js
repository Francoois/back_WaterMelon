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
    }
// FIXME : Here we cannot send a HTTP response for both user and wallet, we have to choose

  });

  return WalletsClass;



});
