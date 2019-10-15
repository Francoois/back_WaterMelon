//dataIndex.js

define([

],function (){
  let attributes = Object.create(null);
  Object.assign(attributes,
    {
      users : {
        strParams : ["first_name","last_name","email","password","api_key"],
        nonStrParams : ["id","is_admin"]
      },
      cards : {
        strParams : ["brand","expired_at","last_4"],
        nonStrParams : ["id", "user_id"]
      },
      wallets : {
        strParams : [],
        nonStrParams : ["user_id"]
      },
      payins : {
        strParams : [],
        nonStrParams : ["wallet_id", "amount"]
      },
      payouts : {
        strParams : [],
        nonStrParams : ["wallet_id", "amount"]
      },
      transfers : {
        strParams : [],
        nonStrParams : ["debited_wallet_id","credited_wallet_id","amount"]
      }
    });
    return attributes;
});
