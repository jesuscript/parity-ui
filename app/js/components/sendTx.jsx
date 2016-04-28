var React = require("react"),
    Web3 = require("web3"),
    _ = require("lodash")

module.exports = React.createClass({
  getInitialState: function(){
    return {
      //TODO: make default gas a config option
      gas: 90000,
      from: "",
      to: "",
      value: 0,
      data: ""
    }
  },
  componentWillReceiveProps: function(newProps){
    if(!this.state.from && newProps.accounts) this.setState({from: newProps.accounts[0]})
  },
  render: function(){
    var options = _.map(this.props.accounts, function(addr){
      return(
        <option key={addr}>{addr}</option>
      )
    })

    return (
      <form className="sendTx" onSubmit={this.onSubmit}>
        <div className="cells">
          <div className="form-group">
            <label>From</label>
            <select value={this.state.from}
                    name="from"
                    className="form-control"
                    onChange={this.onChange.bind(this, "from")}>
              {options}
            </select>
          </div>
          <div className="form-group">
            <label>To</label>
            <input type="text" className="form-control" name="to" value={this.state.to}
                   onChange={this.onChange.bind(this,"to")}/>
          </div>
          <div className="form-group">
            <label>&#926; Value</label>
            <input type="number" step="any"
                   className="form-control"
                   name="value"
                   value={this.state.value}
                   onChange={this.onChange.bind(this, "value")}/>
          </div>
          <div className="form-group">
            <label>Gas</label>
            <input type="number"
                   className="form-control"
                   name="gas"
                   value={this.state.gas}
                   onChange={this.onChange.bind(this,"gas")}/>
          </div>
          <div className="form-group">
            <label>Data</label>
            <textarea className="form-control" rows="3" name="data" value={this.state.data}
                      onChange={this.onChange.bind(this,"data")}></textarea>
          </div>
        </div>
        <input type="submit" className="form-control btn btn-default-strong" value="Send"/>
      </form>
    )
  },
  onSubmit: function(e){
    e.preventDefault()

    var tx = _.cloneDeep(this.state)

    tx.value = Web3.prototype.toWei(tx.value, "ether")

    this.props.onSend(tx)
  },
  onChange: function(name, e){
    e.preventDefault()

    var state = {}

    state[name] = e.target.value

    this.setState(state)
  }
})
