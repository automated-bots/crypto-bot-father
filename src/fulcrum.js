const net = require('net')

class Fulcrum {
  /**
   * Constructor
   * @param {integer} fulcrumPort Fulcrum port
   * @param {string} fulcrumHost (Optional) Fulcrum host, default: 127.0.0.1
   */
  constructor (fulcrumPort, fulcrumHost = '127.0.0.1') {
    this.port = fulcrumPort
    this.host = fulcrumHost
    this.rpcId = 'Crypto Bot'
    this.received = ''
    this.connected = false
    this.connect()
  }

  connect () {
    this.fulcrum = new net.Socket()
    this.fulcrum.setTimeout(10000)
    this.fulcrum.setEncoding('utf8')
    this.fulcrum.setKeepAlive(true, 0)
    this.fulcrum.setNoDelay(true)
    this.fulcrum.on('error', (error) => {
      console.error(error)
      // TODO: when connection can't be made (which error?), set this.connected = false
    })
    this.fulcrum.on('data', data => {
      this.received = data
      console.log(JSON.stringify(this.received))
    })
    this.fulcrum.on('close', e => {
      this.connected = false
    })
    this.fulcrum.connect(this.port, this.host, () => {
      this.connected = true
    })
  }

  close () {
    if (this.connected) {
      this.fulcrum.end()
      this.fulcrum.destroy()
      this.connected = false
    }
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
    if (!this.connected) {
      this.connect() // Try 1x a reconnect for now
    }
    const content = JSON.stringify({
      jsonrpc: '2.0',
      id: this.rpcId,
      method: 'blockchain.address.get_balance',
      params: [address]
    })
    this.fulcrum.write(content + '\n')
    // TODO: Wait for data? And return the received data
    return 'Will be implemented soonish'
  }
}

module.exports = Fulcrum
