'use strict'

let request = require("request");
let cardsTypes = ['visa', 'master_card', 'american_express', 'union_pay', 'jcb'];
let base_url = `http://localhost:8000`;;
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

let createOne = function() {
  return new Promise(
    function(resolve,reject){
      let testTime = Date.now();
      request.post(
      {
        header : {'Content-Type' : 'application/x-www-form-urlencoded'},
        url : base_url+"/cards",
        form : {
          last_4:"1664",
          expired_at:"2019/12/31",
          brand:cardsTypes[getRandomInt(cardsTypes.length-1)],
          user_id:1
        }
      },
      function(error, response, body) {
        let newId = parseInt(response.body);
        expect(response.statusCode).toBe(200);
        resolve(newId);
      });
    }
  );
}
describe("TEST cards CRUD\n", function() {
  describe("CREATE card", function() {
      it("returns status code 200 twice", function(done) {
          createOne().then((newId)=>{
            request.delete(base_url+"/cards/"+newId, function(error, response, body){
            expect(response.statusCode).toBe(200);
            done();
          });
        });
      });
  });
});
