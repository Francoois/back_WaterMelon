//payouts.js

function _deletePayout(req, res){
  return _deleteById("payouts", req.params.id);
}
