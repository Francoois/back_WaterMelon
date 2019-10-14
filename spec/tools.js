//tools.js

module.exports = (function tools(){
  return {

    compareObject : function(source, copy, newId){
      console.log("\nsource : \n"+JSON.stringify(source)+"\n"+"\n\ntestBody :\n"+JSON.stringify(copy));

      let testSource = JSON.parse(JSON.stringify(source));
      testSource.id = newId;

      let testCopy= JSON.parse(JSON.stringify(copy));

      console.log("\nsource : \n"+JSON.stringify(testSource)+"\n"+"testBody :\n"+JSON.stringify(testCopy));
      expect(testCopy).toEqual(testSource);
    },

    getRandomInt : function(max){
      return Math.floor(Math.random() * Math.floor(max));
    },

    dbDateToHumanDate : function(dbDate){
      let d = new Date(dbDate);
      return d.getUTCFullYear()+"/"
      +(parseInt(d.getUTCMonth())+1)+"/"
      +d.getUTCDate();
    }
  }

})();
