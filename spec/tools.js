//tools.js

var compareObject = function(source, copy, newId){

  let testSource = JSON.parse(JSON.stringify(source.form));
  testSource.id = newId;

  let testBody = JSON.parse(copy)[0];

  expect(testBody).toEqual(testSource);
};
module.export = compareObject;
