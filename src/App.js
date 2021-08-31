import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import { WEB3_PROVIDER_URL, ROLLUP_TYPE_HASH, ETH_ACCOUNT_LOCK_CODE_HASH, CONTRACT_ADDR, CONTRACT_ABI  } from './config'
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import Home from './Home'
import { AddressTranslator } from 'nervos-godwoken-integration';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      const depositAddress = await addressTranslator.getLayer2DepositAddress(web3, accounts[0]);

      this.setState({depositAddress: depositAddress})
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
      depositAddress: '',
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
      <div className="container-fluid" class="w-75 mx-auto">
        <h1 class="mb-3 text-center">Simple Poll Dapp</h1>

        <div class="card-group mb-3">
          <div class="card col-6">
            <div class="card-body">
              <h5 class="card-title">ETH Address</h5>
              <p class="card-text">{this.state.account}</p>
            </div>
          </div>
          <div class="card col-6">
            <div class="card-body">
              <h5 class="card-title">Polyjuice address</h5>
              <p class="card-text">{this.state.polyjuiceAddress}</p>
            </div>
          </div>
          
        </div>

        <div class="card-group mb-3">
          <div class="card col-12">
              <div class="card-body">
                <h5 class="card-title">Deposit address</h5>
                <p class="card-text">{this.state.depositAddress.addressString}</p>
                <p class="card-text"><small class="text-muted">This address can be use in <a href="https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000">ForceBridge</a> to transfer your assets to Nervos Layer 2. <br/>Put depositAddress in the receiver field</small></p>
                <a class="btn btn-primary" href="https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000">Bridge assets</a>
              </div>
            </div>

        </div>
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