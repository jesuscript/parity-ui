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
          <td>
            <button className="btn btn-default-strong">
              <span className="icon icon-lock icon-initial-state icon-success"></span>
              <span className="icon icon-lock-open icon-hover-state icon-danger"></span>
            </button>
          </td>
        </tr>
      )
    })
    
    return (
      <div className="accountsOverview">
        <table>
          <thead>
            <tr>
              <th>Address</th>
              <th>Balance</th>
              <th></th>
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
