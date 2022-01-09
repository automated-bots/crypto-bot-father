const ProcessResult = require('./process-result')
const RuntimeError = require('./errors/runtime-error')
const Misc = require('./miscellaneous')

/**
 * Fetch or calculate the data we need
 */
class Fetcher {
  constructor (bitcoin, exchange) {
    this.bitcoin = bitcoin
    this.exchange = exchange
  }

  /**
   * How long does bitcoin exists (since first genesis block)
   * Source: https://www.blockchain.com/btc/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
   * @returns message string
   */
  bitcoinAge () {
    const age = Misc.timestampToDate(Date.now() - 1231002905000) // timestamp ms since creation on the genesis block
    return `Bitcoin age: ${age.year} years, ${age.month} months, ${age.day} days, ${age.hour}h ${age.minute}m ${age.second}s, since the first mined block.`
  }

  /**
   * Retrieve Bitcoin status
   * @returns {Promise} message
   */
  async bitcoinStatus () {
    let text = ''
    try {
      const networkResult = await this.bitcoin.getNetworkInfo()
      text += `
Bitcoin Core version: ${networkResult.subversion}
Protocol version: ${networkResult.protocolversion}
\n*Peer info*
Peers connected: ${networkResult.connections}`
    } catch (error) {
      console.error(error)
      text += 'Error: Could not fetch network info!\n'
    }

    try {
      const peerResult = await this.bitcoin.getPeerInfo()
      text += '\nFirst three peers:'
      if (peerResult.length > 0) {
        let i
        for (i = 0; i < 3; i++) {
          const sendTime = Misc.printDate(new Date(peerResult[i].lastsend * 1000))
          const recieveTime = Misc.printDate(new Date(peerResult[i].lastrecv * 1000))
          const ping = parseFloat(peerResult[i].pingtime * 1000).toFixed(2)
          text += `
Ping: ${ping} ms
Last send: ${sendTime}
Last receive: ${recieveTime}
---`
        }
      } else {
        text += 'Warning: No peers connected...'
      }
    } catch (error) {
      console.error(error)
      text += 'Error: Could not fetch peer info!\n'
    }
    return text
  }

  /**
   * Retrieve Bitcoin network details
   * @return {Promise} message
   */
  async bitcoinNetworkInfo () {
    try {
      const result = await this.bitcoin.getNetworkInfo()
      let text = `
*Bitcoin Network Info*
Bitcoin server version: ${result.version}
Protocol version: ${result.protocolversion}
Connections: ${result.connections}
P2P active: ${result.networkactive}
Minimum relay fee:  ${result.relayfee} BTC/kB
Minimum incremental fee: ${result.incrementalfee} BTC/kB
Networks:`
      const networks = result.networks
      for (let i = 0; i < networks.length; i++) {
        text += `
Name: ${networks[i].name}
Only net: ${networks[i].limited}
Reachable: ${networks[i].reachable}
-----------------------`
      }
      return text
    } catch (error) {
      // The Bitcoin core returns a 500 HTTP error code
      if (error.response && error.response.status === 500) {
        if ('error' in error.response.data) {
          return 'Error: ' + error.response.data.error.message
        } else {
          console.error(error)
          return 'Error: Something went wrong. '
        }
      } else {
        throw error
      }
    }
  }

  /**
   * Retrieve Bitcoin information
   * @returns {Promise} message
   */
  async bitcoinInfo () {
    const blockchainResult = await this.bitcoin.getBlockChainInfo()
    const miningResult = await this.bitcoin.getMiningInfo()
    const exchangeResult = await this.exchange.getExchangeInfo(1) // 1 = Bitcoin
    const bestBlockResult = await this.bitcoin.getBlock(blockchainResult.bestblockhash)
    return ProcessResult.stats(blockchainResult, miningResult, exchangeResult, bestBlockResult)
  }

  /**
   * Estimate the Bitcoin fee
   */
  async bitcoinEstimateFee () {
    const estimateFee = await this.bitcoin.estimateFees()
    return `Estimated fee for confirmation in 6 blocks: ${estimateFee.feerate} BTC/kB`
  }

  /**
   * Retrieve Bitcoin trannsaction details
   * @param {String} hash Bitcoin transaction hash
   * @returns {Promise} message
   */
  async bitcoinTransaction (hash) {
    try {
      // TODO: Retrieve inputs and outputs to determine fee & amounts
      const rawTransaction = await this.bitcoin.getRawTransaction(hash)
      const blockInfo = await this.bitcoin.getBlock(rawTransaction.blockhash)
      const transactionDate = Misc.printDate(new Date(rawTransaction.time * 1000))
      const text = `**Transaction details for [${hash}](${Misc.blockchainExplorerUrl()}/tx/${hash})**
  Confirmations: ${rawTransaction.confirmations}
  Date:  ${transactionDate}
  In Block Height: [${blockInfo.height}](${Misc.blockchainExplorerUrl()}/block/${rawTransaction.blockhash}) with ${blockInfo.nTx} transactions`
      return text
    } catch (error) {
      // The Bitcoin core returns a 500 HTTP error code
      if (error.response && error.response.status === 500) {
        if ('error' in error.response.data) {
          return 'Error: ' + error.response.data.error.message
        } else {
          console.error(error)
          return 'Error: Something went wrong. '
        }
      } else {
        throw error
      }
    }
  }

  /**
   * Retrieve Bitcoin block details
   * @param {String} hash Bitcoin block hash
   */
  async bitcoinBlock (hash) {
    try {
      const blockInfo = await this.bitcoin.getBlock(hash)
      const blockDate = Misc.printDate(new Date(blockInfo.time * 1000))
      return `**Block details for: ${hash}**
  Block Height: [${blockInfo.height}](${Misc.blockchainExplorerUrl()}/block/${hash})
  Confirmations: ${blockInfo.confirmations}
  Nr of transactions: ${blockInfo.nTx}
  Block time: ${blockDate}
  Difficulty: ${blockInfo.difficulty}
  Preview block hash: ${blockInfo.previousblockhash}
  Next block hash: ${blockInfo.nextblockhash}`
    } catch (error) {
      // The Bitcoin core returns a 500 HTTP error code
      if (error.response && error.response.status === 500) {
        if ('error' in error.response.data) {
          return 'Error: ' + error.response.data.error.message
        } else {
          console.error(error)
          return 'Error: Something went wrong. '
        }
      } else {
        throw error
      }
    }
  }

  /**
   * Retrieve Bitcoin address details
   * @param {String} hash Bitcoin address
   * @return {Promise} message
   */
  async bitcoinAddress (address) {
    // const addressResult = await this.bitcoin.getAddressInfo(address)
    // TODO: https://stackoverflow.com/questions/67124777/bitcoin-rpc-get-balance-of-address-outside-wallet
    return 'not yet implemented'
  }

  /**
   * Show latest transactions on address
   * @param {String} hash Bitcoin address
   * @return {Promise} message
   */
  async bitcoinTransactions (address) {
    // TODO ..
    return 'not yet implemented'
  }

  /**
    * Retrieve latest quote information and exchange rates (fiat + crypto).
    * @param {String} symbol Crypto symbol
    * @return {Promise} message
    */
  async priceQuotes (symbol) {
    const symbolUpper = symbol.toUpperCase()
    try {
      const quoteResult = await this.exchange.getLatestPrices(symbolUpper)
      const rateResult = await this.exchange.getExchangeRates(symbolUpper)
      return ProcessResult.priceOverview(symbolUpper, quoteResult, rateResult)
    } catch (error) {
      // The exechange returns a 400 HTTP error code
      if (error.response && error.response.status === 400) {
        return 'Error: Invalid currency symbol'
      } else if (error instanceof RuntimeError) {
        return 'Error: ' + error.message
      } else {
        throw error
      }
    }
  }

  /**
    * Retrieve latest market statistics
    * @param {String} symbol Crypto symbol
    * @return {Promise} message
  */
  async marketStats (symbol) {
    const symbolUpper = symbol.toUpperCase()
    try {
      const quoteResult = await this.exchange.getLatestPrices(symbolUpper)
      const rateResult = await this.exchange.getExchangeRates(symbolUpper)
      return ProcessResult.marketStats(symbolUpper, quoteResult, rateResult)
    } catch (error) {
      // The exchange returns a 400 HTTP error code
      if (error.response && error.response.status === 400) {
        return 'Error: Invalid currency symbol'
      } else if (error instanceof RuntimeError) {
        return 'Error: ' + error.message
      } else {
        throw error
      }
    }
  }
}

module.exports = Fetcher
