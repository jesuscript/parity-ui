var React = require("react"),
    Web3 = require("web3"),
    numeral = require("numeral"),
    _ = require("lodash"),
    BigNumber = require("bignumber.js")


var appActions = require("../actions/appActions")

module.exports = React.createClass({
  render: function(){
    var balanceList = _.map(this.props.balances, (account) => {
      var balance = numeral(
        Web3.prototype.fromWei(account.balance, "ether").toString()
      ).format("0,0.[0000]")

      var lockButton = (this.props.passwords || {})[account.address] ? (
        <button className="btn btn-default-strong"
                onClick={this._onLockClick.bind(this, "lock", account.address)}>
          <span className="icon icon-lock-open icon-initial-state icon-danger"></span>
          <span className="icon icon-lock icon-hover-state icon-success"></span>
        </button>
      ) : (
        <button className="btn btn-default-strong"
                onClick={this._onLockClick.bind(this, "unlock", account.address)}>
          <span className="icon icon-lock icon-initial-state icon-success"></span>
          <span className="icon icon-lock-open icon-hover-state icon-danger"></span>
        </button>
      )

      return(
        <tr key={account.address}>
          <td>
            {account.address}
          </td>
          <td>
            &#926; {balance}
          </td>
          <td>
            {lockButton}
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
  },
  _onLockClick: function(type, address, e){
    e.preventDefault()

    appActions[(type === "unlock") ? "unlockAccount" : "lockAccount"](address)
  }
})
