const axios = require('axios')

class BitcoinCash {
  /**
   * Constructor
   * @param {string} bitcoindHost
   * @param {integer} bitcoindPort
   * @param {string} bitcoindRPCUser
   * @param {string} bitcoindRPCPass
   */
  constructor (bitcoindHost, bitcoindPort, bitcoindRPCUser, bitcoindRPCPass) {
    // Local Bitcoin Cash node API
    this.bitcoind = axios.create({
      baseURL: 'http://' + bitcoindHost + ':' + bitcoindPort,
      timeout: 100000,
      auth: {
        username: bitcoindRPCUser,
        password: bitcoindRPCPass
      }
    })
    this.rpcId = 'Crypto Bot'
  }

  /*******************************
   * Bitcoin Cash Node methods *
   *******************************/

  /**
   * Get peer node info from Bitcoin cash node (BCHN)
   *
   * @return {Promise} Axios promise
   */
  getPeerInfo () {
    return this.bitcoind.post('/', {
      method: 'getpeerinfo',
      params: []
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
      id: this.rpcId,
      method: 'getblockchaininfo',
      params: []
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
      id: this.rpcId,
      method: 'getnetworkinfo',
      params: []
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get mining info from the BCHN itself
   *
   * @return {Promise} Axios promise (blocks, difficulty, networkhashps)
   */
  getMiningInfo () {
    return this.bitcoind.post('/', {
      jsonrpc: '1.0',
      id: this.rpcId,
      method: 'getmininginfo',
      params: []
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Estimate BCH fee
   * @return {Promise} Axios promise (fee)
   */
  estimateFee () {
    return this.bitcoind.post('/', {
      jsonrpc: '1.0',
      id: this.rpcId,
      method: 'estimatefee'
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get raw transaction details (already decoded)
   * @param {String} hash Transaction hash
   * @erturn {Promise} Axios promise
   */
  getRawTransaction (hash) {
    return this.bitcoind.post('/', {
      jsonrpc: '1.0',
      id: this.rpcId,
      method: 'getrawtransaction',
      params: [hash, true]
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }

  /**
   * Get block (decoded verbosity 1)
   * @param {String} hash Block header hash
   * @erturn {Promise} Axios promise
   */
  getBlock (hash) {
    return this.bitcoind.post('/', {
      jsonrpc: '1.0',
      id: this.rpcId,
      method: 'getblock',
      params: [hash]
    })
      .then(response => {
        return Promise.resolve(response.data.result)
      })
  }
}

module.exports = BitcoinCash
