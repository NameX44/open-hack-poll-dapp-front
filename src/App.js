import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import { WEB3_PROVIDER_URL, ROLLUP_TYPE_HASH, ETH_ACCOUNT_LOCK_CODE_HASH, CONTRACT_ADDR, CONTRACT_ABI  } from './config'
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import Home from './Home'
import { AddressTranslator } from 'nervos-godwoken-integration';

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      const godwokenRpcUrl = WEB3_PROVIDER_URL;
      const providerConfig = {
        rollupTypeHash: ROLLUP_TYPE_HASH,
        ethAccountLockCodeHash: ETH_ACCOUNT_LOCK_CODE_HASH,
        web3Url: godwokenRpcUrl,
      };
      const provider = new PolyjuiceHttpProvider(
        godwokenRpcUrl,
        providerConfig
      );

      window.web3 = new Web3(provider);
      // const web3 = new Web3(provider);
      // this.setState({ web3 });
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = [window.ethereum.selectedAddress];
    this.setState({ account: accounts[0] });
    console.log("account address : " + accounts[0])
    if (this.state.account) {
      const addressTranslator = new AddressTranslator();
      const polyjuiceAddress = addressTranslator.ethAddressToGodwokenShortAddress(accounts[0]);
      this.setState({polyjuiceAddress: polyjuiceAddress})
    }

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
    console.log(this.state.account)
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