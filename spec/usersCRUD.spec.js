'use strict'

var request = require("request");
let base_url = `http://localhost:8000/v1`;
const adminToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxOSwiZW1haWwiOiJ5b0B5YWhvby5mciIsImlzX2FkbWluIjp0cnVlLCJpYXQiOjE1NzIwMjY0ODZ9.Le5SiNg2WpnPrLoz0BINTZ47paTq1JUJ_YZ0SRlUem0`;

let userAttributes = {
  header : {'Content-Type' : 'application/x-www-form-urlencoded'},
  url : base_url+"/users",
  headers : {
    "x-auth-token" : adminToken,
  },
  form : {
    first_name:"jasmin",
    last_name:"testor",
    email:"define me at runtime",
    password:"passsword",
    api_key:"lakeeeeeey",
    is_admin:true
  }
},
updateUserParams = {
  header : {'Content-Type' : 'application/x-www-form-urlencoded'},
  /*url : "define me at runtime",*/
  form : {
    password : "passwordWasUpdatedHere"
  }
};
let createOneUser = function() {
  return new Promise(
    function(resolve,reject){
      let testTime = Date.now();
      userAttributes.form.email="jasmin"+testTime+"@wanadoo.fr";

      request.post(

      userAttributes,
      function(error, response, body) {
        expect(response.statusCode).toBe(200);
        const userId = JSON.parse(body).id;
          console.log(userId);
        resolve(userId);
      });
    }
  );
};

describe("Users API OK \n", function() {
     describe("GET /users", function() {
         it("returns status code 200", function(done) {
             request.get(
             {
               url : base_url+"/users",
               headers : {
                 "x-auth-token" : adminToken,
               }
             }, function(error, response, body)
             {
             expect(response.statusCode).toBe(200);
             done();
            });
         });
    });
    describe("POST /users & GET new user", function() {
        it("returns status code 200 twice", function(done) {
            createOneUser().then((addedUserId)=>{
              request.get(base_url+"/users/"+addedUserId,
              {
                headers : {
                  "x-auth-token" : adminToken,
                }
              }, function(error, response, body){
                      expect(response.statusCode).toBe(200);

                     /*let testUserAttributes = JSON.parse(JSON.stringify(userAttributes.form));
                      testUserAttributes.id=addedUserId;

                      let testBody = JSON.parse(response.body)[0];
                      testBody.is_admin=(testBody.is_admin===1);*/

                      //expect(testBody).toEqual(testUserAttributes);
                      done();
            });
          });
        });
   });
   describe("DELETE after CREATE USER", function() {
       it("returns status code 200 twice", function(done) {
           createOneUser().then((addedUserId)=>{
             request.delete({
               url : base_url+"/users/"+addedUserId,
               headers : {
                 "x-auth-token" : adminToken,
               }
             }, function(error, response, body){
             expect(response.statusCode).toBe(200);
             done();
           });
         });
       });
  });
  describe("UPDATE after CREATE USER", function() {
      it("returns status code 200 twice", function(done) {
          createOneUser().then((addedUserId)=>{
            let url=base_url+"/users/"+addedUserId;
              console.log(url)
            request(
              {
                method : 'PUT',
                url : url,
                form : { password : "tasvucamarche?" },
                headers : {
                  "x-auth-token" : adminToken,
                }
              },
              function(error, response, body){
                expect(response.statusCode).toBe(200);
                done();
              });
        });
      });
 });
});
