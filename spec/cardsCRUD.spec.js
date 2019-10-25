'use strict'

var tools = require('./tools.js');

let request = require("request");
let cardsTypes = ['visa', 'master_card', 'american_express', 'union_pay', 'jcb'];
let base_url = `http://localhost:8000/v1`;
let attributes = null;
const adminToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxOSwiZW1haWwiOiJ5b0B5YWhvby5mciIsImlzX2FkbWluIjp0cnVlLCJpYXQiOjE1NzIwMjY0ODZ9.Le5SiNg2WpnPrLoz0BINTZ47paTq1JUJ_YZ0SRlUem0`;

let createOne = function() {
  return new Promise(
    function(resolve,reject){

      let testTime = Date.now();
      attributes = {
        header : {'Content-Type' : 'application/x-www-form-urlencoded'},
        url : base_url+"/cards",
        headers : {
          "x-auth-token" : adminToken,
        },
        form : {
          last_4:"1664",
          expired_at:"2019-12-31 00:00:00",
          brand:cardsTypes[tools.getRandomInt(cardsTypes.length-1)],
          user_id:105
        }
      };

      request.post(
        attributes,
        function(error, response, body) {
          if (error) throw error;
          let newId = JSON.parse(body).id;
          expect(response.statusCode).toBe(200);
          resolve(newId);
        }
      );
    }
  );
};

describe("TEST cards CRUD\n", function() {

  describe("CREATE then DELETE card", function() {
      it("returns status code 200 twice", function(done) {
          createOne().then((newId)=>{
            request.delete(base_url+"/cards/"+newId,
            {
              headers : { 'x-auth-token' : adminToken }
            },
            function(error, response, body){
            expect(response.statusCode).toBe(200);
            done();
          });
        });
      });
  });
  describe("CREATE then UPDATE then GET card", function() {

      it("returns status code 200 twice", function(done) {
          createOne().then(
            (newId)=>{
              let url = base_url+"/cards/"+newId;
              request(url,
                {
                  method : 'PUT',
                  url : url,
                  form : { last_4 : "7357" },
                  headers : { 'x-auth-token' : adminToken }
                },
                function(error, response, body){
                  expect(response.statusCode).toBe(200);
                  done();
                }
              );
              return(newId);
            }
          ).then(
            (newId)=>
            {
              request.get(
                base_url+"/cards/"+newId,
                {
                  headers : { 'x-auth-token' : adminToken }
                },
                function(err, resp, body){
                  //console.log(body);
                  expect(resp.statusCode).toBe(200);
                  done();
                  /*
                  var created = JSON.parse(resp.body)[0];
                  created.expired_at = tools.dbDateToHumanDate(created.expired_at);
                  //attributesTest.form.id = "7370";

                  //console.log("\n original : \n"+JSON.stringify(attributesTest.form)+"\n"+"copy :\n"+JSON.stringify(created));
                  tools.compareObject(attributes.form, created, newId);*/
                });
            }
          );
      });
  });
});
