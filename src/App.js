import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import { ZeroEx } from '0x.js'
import BigNumber from 'bignumber.js'

const getWeb3 = new Promise((resolve, reject) => {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', () => {
    let web3 = window.web3

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      resolve('Injected web3 detected.')
    } else {
      reject('No web3 instance injected.')
    }
  })
})

const startZeroEx = () => 
  new Promise((resolve, reject) => {
    const gasPrice = new BigNumber(window.web3.toWei(2, 'gwei'))
    window.zeroExInstance = new ZeroEx(window.web3.currentProvider, { gasPrice })
    resolve(window.zeroExInstance)
  })

getWeb3
.then(startZeroEx)
.then(console.log)
.catch(err => console.log(`caught ${err}`))

const signedOrder = {
  "ecSignature": {
      "r": "0xa77abf5ec2a9a7c9ef8c5567919ec6b4c352910e4f7f4bd6848a80b8b7e1a515",
      "s": "0x20c2b659b8244fc04a4ab6798fc301e7cb9e1271032a5546989a4781c07d7714",
      "v": 28
  },
  "exchangeContractAddress": "0x90fe2af704b34e0224bf2299c838e04d4dcf1364",
  "expirationUnixTimestampSec": "1504626533",
  "feeRecipient": "0xeb71bad396acaa128aeadbc7dbd59ca32263de01",
  "maker": "0x10e9fe3ad80ec3ea9e1c7c4513af722d7efc673e",
  "makerFee": "0",
  "makerTokenAddress": "0x05d090b51c40b020eab3bfcb6a2dff130df22e9c",
  "makerTokenAmount": "100000000000000000",
  "salt": "34487824560316349828013703320358453704153649154066998740331354344990868960345",
  "taker": "0x0000000000000000000000000000000000000000",
  "takerFee": "30000000000000",
  "takerTokenAddress": "0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570",
  "takerTokenAmount": "30000000000000000"
}
const fillTakerTokenAmount = new BigNumber("30000000000000000")
const shouldThrowOnInsufficientBalanceOrAllowance = true

const convertOrderStringsToBigNums = order => ({
  ...order,
  expirationUnixTimestampSec: new BigNumber(order.expirationUnixTimestampSec),
  makerFee: new BigNumber(order.makerFee),
  makerTokenAmount: new BigNumber(order.makerTokenAmount),
  takerFee: new BigNumber(order.takerFee),
  takerTokenAmount: new BigNumber(order.takerTokenAmount),
  salt: new BigNumber(order.salt),
})

const fillOrder = event => {
  event.preventDefault();
  return window.zeroExInstance.getAvailableAddressesAsync()
  .then(([userWallet]) => {
    const order = convertOrderStringsToBigNums(signedOrder)

    console.log(order)
    console.log(userWallet)
    window.zeroExInstance.exchange.validateFillOrderThrowIfInvalidAsync(
        order,
        fillTakerTokenAmount,
        userWallet
    ).then(isOrderValid => {
      if (isOrderValid !== undefined) throw new Error('Order is not valid')
      return window.zeroExInstance.exchange.fillOrderAsync(
        order,
        fillTakerTokenAmount,
        shouldThrowOnInsufficientBalanceOrAllowance,
        userWallet
      )
    }).catch(err => {throw err})
  }).catch(err => console.log(`Caught fillOrder ${err}`))
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          I’m using the following arguments:
          <code>
          {'{'}
              "ecSignature": {'{'}
                  "r": "0xa77abf5ec2a9a7c9ef8c5567919ec6b4c352910e4f7f4bd6848a80b8b7e1a515",
                  "s": "0x20c2b659b8244fc04a4ab6798fc301e7cb9e1271032a5546989a4781c07d7714",
                  "v": 28
              {'}'},
              "exchangeContractAddress": "0x90fe2af704b34e0224bf2299c838e04d4dcf1364",
              "expirationUnixTimestampSec": "1504626533",
              "feeRecipient": "0xeb71bad396acaa128aeadbc7dbd59ca32263de01",
              "maker": "0x10e9fe3ad80ec3ea9e1c7c4513af722d7efc673e",
              "makerFee": "0",
              "makerTokenAddress": "0x05d090b51c40b020eab3bfcb6a2dff130df22e9c",
              "makerTokenAmount": "100000000000000000",
              "salt": "34487824560316349828013703320358453704153649154066998740331354344990868960345",
              "taker": "0x0000000000000000000000000000000000000000"
              "takerFee": "30000000000000",
              "takerTokenAddress": "0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570",
              "takerTokenAmount": "30000000000000000"
          {'}'},
          "30000000000000000",
          true,
          "0xefc470278d2f35b22b97b04abf1c973638583a4a"
          {'}'}
          </code>
        </p>
        <button
          onClick={fillOrder}>
        Fill Order
        </button>
      </div>
    )
  }
}

export default App
