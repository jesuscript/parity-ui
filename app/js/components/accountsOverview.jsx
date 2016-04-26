var React = require("react"),
    Web3 = require("web3"),
    numeral = require("numeral"),
    _ = require("lodash")

module.exports = React.createClass({
  render: function(){
    var balanceList = _.map(this.props.balances, function(account){
      var balance = numeral(
        Web3.prototype.fromWei(account.balance, "ether").toString()
      ).format("0,0.[0000]")

      return(
        <tr key={account.address}>
          <td>
            {account.address}
          </td>
          <td>
            &#926; {balance}
          </td>
        </tr>
      )
    })
    
    return (
      <div className="accountsOverview">
        <table className="">
          <thead>
            <tr>
              <th>Address</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {balanceList}
          </tbody>
        </table>
      </div>
    )
  }
})
