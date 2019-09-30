var request = require("request");

let base_url = `http://localhost:8000`;

let testTime = Date.now();
let addedUserId,
userAttributes = {
  header : {'Content-Type' : 'application/x-www-form-urlencoded'},
  url : base_url+"/users",
  form : {
    first_name:"jasmin",
    last_name:"testor",
    email:"jasmin"+testTime+"@wanadoo.fr",
    password:"passsword",
    api_key:"lakeeeeeey",
    is_admin:false
  }
};

describe("Users API OK", function() {
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
            new Promise(
              function(resolve,reject){
                request.post(
                userAttributes,
                function(error, response, body) {
                  addedUserId = parseInt(response.body);
                  expect(response.statusCode).toBe(200);
                  resolve();
                  //done();
                });
              }
            ).then(()=>{
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
});
