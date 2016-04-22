const _ = require("lodash");

module.exports = {
  enumerate: function(arr){
    return _.reduce(arr, function(e, v){
      e[v] = v;
    },{});
  }
};
