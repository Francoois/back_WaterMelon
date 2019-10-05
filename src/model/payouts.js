//payouts.js

define([
  'model/datamodel'
], function (datamodel){
  'use strict'

  let PayoutsClass = Object.create(datamodel);
  Object.assign(PayoutsClass,{

    table : 'payouts'

  });
  return PayoutsClass;
});
