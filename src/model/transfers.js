//transfers.js

function _getTransferById(id,res){
  let query = `SELECT * FROM transfers WHERE id=${id}`;
  let getQProm = queryDB(query,res);
  getQProm.then(
    (result)=>{
      if (Array.length(result)==1){
        console.log(result);
      } else console.error("fail to get by id");
    }
  ).catch(()=>{sendError(res)});
}
