var request = require("request");

let base_url = `http://localhost:8000`;

let testTime = Date.now();

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

    describe("POST /users", function() {
        it("returns status code 200", function(done) {
            request.post(
              {
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
              },
              function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
              });
        });
   });
});
