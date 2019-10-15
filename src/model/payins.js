//payins.js

define([
  'model/moneyFlow'
], function (moneyFlow){
  'use strict'

  let Payins = Object.create(moneyFlow);
  Object.assign(Payins,{

    table : 'payins'

  });
  return Payins;
});
