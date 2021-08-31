import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import { WEB3_PROVIDER_URL, ROLLUP_TYPE_HASH, ETH_ACCOUNT_LOCK_CODE_HASH, CONTRACT_ADDR, CONTRACT_ABI  } from './config'
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import Home from './Home'
import { AddressTranslator } from 'nervos-godwoken-integration';

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const godwokenRpcUrl = WEB3_PROVIDER_URL;
    const providerConfig = {
        rollupTypeHash: ROLLUP_TYPE_HASH,
        ethAccountLockCodeHash: ETH_ACCOUNT_LOCK_CODE_HASH,
        web3Url: godwokenRpcUrl
    };
    const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
    const web3 = new Web3(provider);
    // const web3 = new Web3("http://127.0.0.1:9545");
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const addressTranslator = new AddressTranslator();
    const polyjuiceAddress = addressTranslator.ethAddressToGodwokenShortAddress(accounts[0]);
    this.setState({polyjuiceAddress: polyjuiceAddress})
    const simplePoll = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDR)
    this.setState({ simplePoll })
    const pollCount = await simplePoll.methods.pollCount().call()
    this.setState({ pollCount })
    for (var i = 0; i <= pollCount - 1; i++) {
      const poll = await simplePoll.methods.polls(i).call()
      this.setState({
        polls: [...this.state.polls, poll]
      })
    }
    this.setState({ loading: false })
  }

  constructor(props) {
    super(props)
    this.createPoll = this.createPoll.bind(this)
    this.state = {
      account: '',
      polyjuiceAddress: '',
      pollCount: 0,
      polls: [],
      loading: true
    }
  }

  createPoll(content) {
    this.setState({ loading: true })
    this.state.simplePoll.methods.createPoll(content).send({ from: this.state.account, gas: 6000000 })
    .once('receipt', (receipt) => {
      console.log("poll created")
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  render() {
    return (
      <div className="container-fluid">
        <h1>Simple Poll Dapp</h1>
        <p>Your account: {this.state.account}</p>
        <p>Polyjuice address: {this.state.polyjuiceAddress}</p>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex justify-content-center">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Home
                  polls={this.state.polls}
                  createPoll={this.createPoll} />
              }
            </main>
        </div>
      </div>
    );
  }
}

export default App;