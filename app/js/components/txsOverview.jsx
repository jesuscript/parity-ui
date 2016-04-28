var React = require("react"),
    Web3 = require("web3"),
    _ = require("lodash")

module.exports = React.createClass({
  render: function(){
    var transactionsList = _.map(
      _.compact(_.orderBy(this.props.transactions, "blockNumber", "desc")),
      (tx) => {
        var value = tx ? "Ξ " + Web3.prototype.fromWei(tx.value, "ether") : "",
            status,
            statusClass

        if(tx.blockNumber){
          status="Confirmed"
          statusClass = "text-success"
        }else{
          status="Pending"
          statusClass = "text-warning"
        }

        return (
          <tr key={tx.hash} onClick={this._txClicked.bind(this,tx.hash)} className="clickable">
            <td>
              {tx.hash}
            </td>
            <td>
              <span className={statusClass}>{status}</span>
            </td>
            <td>
              {value}
            </td>
          </tr>
        )
      })
    
    return (
      <div className="txs-overview">
        <table>
          <thead>
            <tr>
              <th>
                Hash
              </th>
              <th>
                Status
              </th>
              <th>
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {transactionsList}
          </tbody>
        </table>
      </div>
    )
  },
  _txClicked: function(hash, e){
    e.preventDefault();
    this.props.onTxSelect(hash)
  }
})
