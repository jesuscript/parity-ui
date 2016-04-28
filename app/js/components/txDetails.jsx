var React = require("react"),
    numeral = require("numeral"),
    Web3 = require("web3"),
    _ = require("lodash")

module.exports = React.createClass({
  render: function(){
    var tx = this.props.transaction || {}

    var txProperties = _.map(tx, function(v,k){
      var val
      
      if(_.isNull(v)){
        val = ""
      }else{
        if(k == "value"){
          val = "Ξ " + Web3.prototype.fromWei(v, "ether")
        } else if(k=="gasPrice"){
          val = v + " wei"
        } else{
          val = v.toString()
        }
        
      }
      return(
        <tr key={k}>
          <td>
            {k}
          </td>
          <td>
            {val}
          </td>
        </tr>
      )
    }), txIcon = tx.blockNumber ? <span className="icon icon-success icon-check"></span> :
          <span className="icon icon-warning icon-clock"></span>

    return (
      <div className="tx-details">
        <h3>
          {txIcon} {tx.blockNumber ? "Confirmed" : "Pending"}
        </h3>
        <table>
          <tbody>
            {txProperties}
          </tbody>
        </table>
      </div>
    )
  }
})
