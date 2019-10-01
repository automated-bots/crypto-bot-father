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
      timeout: 10000,
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
}

module.exports = Bitcoin
