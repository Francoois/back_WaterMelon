//dataIndex.js

define([

],function (){
  let attributes = Object.create(null);
  Object.assign(attributes,
    {
      users : {
        strParams : ["first_name","last_name","email","password","api_key"],
        nonStrParams : ["id","is_admin"],
        optional : ['api_key', 'is_admin'],
        notUserDefined : ['id']
      },
      cards : {
        strParams : ["brand","expired_at","last_4"],
        nonStrParams : ["id", "user_id"],
        optional : [],
        notUserDefined : ['id']
      },
      wallets : {
        strParams : [],
        nonStrParams : ["user_id"],
        optional : [],
        notUserDefined : ['id']
      },
      payins : {
        strParams : [],
        nonStrParams : ["wallet_id", "amount"],
        optional : [],
        notUserDefined : ['id']
      },
      payouts : {
        strParams : [],
        nonStrParams : ["wallet_id", "amount"],
        optional : [],
        notUserDefined : ['id']
      },
      transfers : {
        strParams : [],
        nonStrParams : ["debited_wallet_id","credited_wallet_id","amount"],
        optional : [],
        notUserDefined : ['id']
      }
    });
    return attributes;
});
