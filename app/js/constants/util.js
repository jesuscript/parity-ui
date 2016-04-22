const _ = require("lodash");

module.exports = {
  enumerate: function(arr){
    return _.reduce(arr, function(v, e){
      e[v] = v;
    },{});
  }
};
