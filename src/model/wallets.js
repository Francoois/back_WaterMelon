//wallets.js

// Wallet is unique : created with users
// XXX : Trigger event to create wallet ?
function createWallet(id,res){
  let query = _insertQueryBuilder("wallets", {
    body : {
      user_id : id
    }
  });
  return queryDB(query,res);
}
// #ASK: Create wallet after user, or at the same time with SQL trigger ?
// FIXME : Here we cannot send a HTTP response for both user and wallet, we have to choose

module.exports = {createWallet}
