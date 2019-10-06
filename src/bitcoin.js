const axios = require('axios')
// const qs = require('qs')

class Bitcoin {
  /**
   * Constructor
   * @param {string} bitcoindHost
   * @param {integer} bitcoindPort
   * @param {string} bitcoindRPCUser
   * @param {string} bitcoindRPCPass
   */
  constructor (bitcoindHost, bitcoindPort, bitcoindRPCUser, bitcoindRPCPass) {
    // Local Bitcoin core deamon API
    this.bitcoind = axios.create({
      baseURL: 'http://' + bitcoindHost + ':' + bitcoindPort,
      timeout: 100000,
      auth: {
        username: bitcoindRPCUser,
        password: bitcoindRPCPass
      }
    })
  }

  /*******************************
   * Bitcoin Core Daemon methods *
   *******************************/

  /**
   * Get peer node info from Bitcoin core
   *
   * @return {Promise} Axios promise
   */
  getPeerInfo () {
    return this.bitcoind.post('/', {
      method: 'getpeerinfo',
      params: {}
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get blockchain info
   * @return {Promise} Axios promise
   */
  getBlockChainInfo () {
    return this.bitcoind.post('/', {
      jsonrpc: '1.0',
      id: 'Bitcoin Bot',
      method: 'getblockchaininfo',
      params: {}
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get network info from the core itself
   *
   * @return {Promise} Axios promise (blocks, headers, bestblockhash, difficulty, mediantime, softforks)
   */
  getNetworkInfo () {
    return this.bitcoind.post('/', {
      jsonrpc: '1.0',
      id: 'Bitcoin Bot',
      method: 'getnetworkinfo',
      params: {}
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get mining info from the core itself
   *
   * @return {Promise} Axios promise (blocks, difficulty, networkhashps)
   */
  getMiningInfo () {
    return this.bitcoind.post('/', {
      jsonrpc: '1.0',
      id: 'Bitcoin Bot',
      method: 'getmininginfo',
      params: {}
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /*
   * Get address info
   * @return {Promise} Axios promise (id & balance)
   */
  getAddressInfo (address) {
    // https://bitcoin.stackexchange.com/questions/10090/how-to-get-an-addresss-balance-with-the-bitcoin-client
    // https://bitcoin.org/en/developer-reference#getreceivedbyaddress
    // TODO:
  }
}

module.exports = Bitcoin
