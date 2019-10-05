//payins.js

define([
  'model/datamodel'
], function (datamodel){
  'use strict'

  let PayinsClass = Object.create(datamodel);
  Object.assign(PayinsClass,{

    table : 'payins',

    create : function(req){
      datamodel.create.call(this, req);
    }

  });
  return PayinsClass;
});
