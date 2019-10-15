//payouts.js

define([
  'model/moneyFlow'
], function (moneyFlow){
  'use strict'

  let Payouts = Object.create(moneyFlow);
  Object.assign(Payouts,{

    table : 'payouts'

  });
  return Payouts;
});
