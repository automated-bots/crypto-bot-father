const axios = require('axios')

class Fulcrum {
  /**
   * Constructor
   * @param {string} fulcrumHost
   * @param {integer} fulcrumPort
   */
  constructor (fulcrumHost, fulcrumPort) {
    // Local Bitcoin Cash node API
    this.bitcoind = axios.create({
      baseURL: 'http://' + fulcrumHost + ':' + fulcrumPort,
      timeout: 100000
    })
    this.rpcId = 'Crypto Bot'
  }

  /*******************************
   * Fulcrum methods *
   *******************************/
  /**
   * Return the confirmed and unconfirmed balances of a Bitcoin Cash address.
   * @param {String} address Bitcoin Cash address
   * @erturn {Promise} Axios promise
   */
  getBalance (address) {
    return this.bitcoind.post('/', {
      jsonrpc: '2.0',
      id: this.rpcId,
      method: 'blockchain.address.get_balance',
      params: [address]
    })
      .then(response => {
        return Promise.resolve(response.data)
      })
  }
}

module.exports = Fulcrum
