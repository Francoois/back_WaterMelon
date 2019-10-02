'use strict'

var request = require("request");

let base_url = `http://localhost:8000`;

let testTime = Date.now();
let userAttributes = {
  header : {'Content-Type' : 'application/x-www-form-urlencoded'},
  url : base_url+"/users",
  form : {
    first_name:"jasmin",
    last_name:"testor",
    email:"define me at runtime",
    password:"passsword",
    api_key:"lakeeeeeey",
    is_admin:false
  }
},
updateUserParams = {
  header : {'Content-Type' : 'application/x-www-form-urlencoded'},
  /*url : "define me at runtime",*/
  form : {
    password : "tasvucamarche?"
  }
};
let createOneUser = function() {
  return new Promise(
    function(resolve,reject){
      testTime = Date.now();
      userAttributes.form.email="jasmin"+testTime+"@wanadoo.fr";
      request.post(
      userAttributes,
      function(error, response, body) {
        let addedUserId = parseInt(response.body);
        expect(response.statusCode).toBe(200);
        console.log("CREATE USER : created id = "+addedUserId);
        resolve(addedUserId);
        //done();
      });
    }
  );
}

describe("Users API OK \n", function() {
     describe("GET /users", function() {
         it("returns status code 200", function(done) {
             request.get(base_url+"/users", function(error, response, body)
             {
             expect(response.statusCode).toBe(200);
             done();
            });
         });
    });
    describe("POST /users & GET new user", function() {
        it("returns status code 200 twice", function(done) {
            createOneUser().then((addedUserId)=>{
              request.get(base_url+"/users/"+addedUserId, function(error, response, body){
              expect(response.statusCode).toBe(200);

              let testUserAttributes = JSON.parse(JSON.stringify(userAttributes.form));
              testUserAttributes.id=addedUserId;

              let testBody = JSON.parse(response.body)[0];
              testBody.is_admin=new Boolean(testBody.is_admin);

              expect(testBody).toEqual(testUserAttributes);
              done();
            });
          });
        });
   });
   describe("DELETE after CREATE USER", function() {
       it("returns status code 200 twice", function(done) {
           createOneUser().then((addedUserId)=>{
             request.delete(base_url+"/users/"+addedUserId, function(error, response, body){
             expect(response.statusCode).toBe(200);
             console.log("DELETE USER : deleted user id = "+addedUserId);
             done();
           });
         });
       });
  });
  describe("UPDATE after CREATE USER", function() {
      it("returns status code 200 twice", function(done) {
          createOneUser().then((addedUserId)=>{
            let url=base_url+"/users/"+addedUserId;
            request(
              {
              method : 'PUT',
              url : url,
              form : { attribute : "password",
              value : "tasvucamarche?" }
            },
              function(error, response, body){
            expect(response.statusCode).toBe(200);
            console.log("UPDATE USER : updated user id = "+addedUserId);
            done();
          });
        });
      });
 });
});
