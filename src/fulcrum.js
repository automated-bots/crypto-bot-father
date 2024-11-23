import { Socket } from 'net'
import { globalState } from './globalState.js'

export default class Fulcrum {
  /**
   * Constructor
   * @param {integer} fulcrumPort Fulcrum port
   * @param {string} fulcrumHost Fulcrum host
   */
  constructor (fulcrumPort, fulcrumHost) {
    this.port = fulcrumPort
    this.host = fulcrumHost
    this.received = {}
    this.receivedError = {}
    this.connected = false
    this.connect()
  }

  connect () {
    this.fulcrum = new Socket()
    this.fulcrum.setTimeout(10000)
    this.fulcrum.setEncoding('utf8')
    this.fulcrum.setKeepAlive(true, 0)
    this.fulcrum.setNoDelay(true)
    this.fulcrum.on('error', (error) => {
      console.error(`Fulcrum error:\n ${error}`)
      // Set our health to NOK
      globalState.errorState = true
    })
    this.fulcrum.on('data', data => {
      try {
        const json = JSON.parse(data)
        if ('id' in json && 'result' in json) {
          this.received[json.id] = json
        } else if ('error' in json && 'id' in json && 'message' in json.error) {
          this.receivedError[json.id] = json.error
        } else {
          console.error('Missing JSON data in received object')
          console.error(`Received data: ${data}`)
        }
      } catch (err) {
        console.error(err)
      }
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
   * Fulcrum methods             *
   *******************************/
  /**
   * Return the confirmed and unconfirmed balances of a Bitcoin Cash address.
   * @param {String} address Bitcoin Cash address
   * @erturn {Promise} Axios promise
   */
  async getBalance (address) {
    if (!this.connected) {
      this.connect() // Try 1x a reconnect for now
    }
    const content = JSON.stringify({
      jsonrpc: '2.0',
      id: 'getbalance',
      method: 'blockchain.address.get_balance',
      params: [address]
    })
    this.fulcrum.write(content + '\n')
    // Now try to retrieve the data
    let retries = 0
    while (!('getbalance' in this.received)) {
      await new Promise(resolve => setTimeout(resolve, 10))
      retries++
      if (retries === 1000) break
    }
    if ('getbalance' in this.received) {
      const result = this.received.getbalance.result
      delete this.received.getbalance
      return result
    } else if ('getbalance' in this.receivedError) {
      const result = this.receivedError.getbalance
      delete this.receivedError.getbalance
      return result
    } else {
      return null
    }
  }
}
