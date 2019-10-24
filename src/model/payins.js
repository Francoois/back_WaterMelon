//payins.js

define([
  'model/moneyFlow'
], function (moneyFlow){
  'use strict'

  let Payins = Object.create(moneyFlow);
  Object.assign(Payins,{

    table : 'payins',
    
  });
  return Payins;
});

// TODO : Si pas de payins, le 404 du queryDB n'est pas une erreur, l'utilisateur n'en a jamais fait
