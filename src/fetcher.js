const axios = require('axios')
const ProcessResult = require('./process-result')
const RuntimeError = require('./errors/runtime-error')
const Misc = require('./miscellaneous')

/**
 * Fetch or calculate the data we need
 */
class Fetcher {
  constructor (bitcoin) {
    this.bitcoin = bitcoin
    this.jsFinance = axios.create({
      baseURL: 'https://finance.melroy.org/v1',
      timeout: 10000
    })
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
        throw error // Re-throw error
      }
    }
  }

  /**
   * Retrieve Bitcoin information
   * @returns {Promise} message
   */
  async bitcoinInfo () {
    const blockchainResult = await this.bitcoin.getBlockChainInfo()
    const miningResultLocal = await this.bitcoin.getMiningInfo()
    const miningResult = await this.jsFinance.get('/cryptos/mining/BTC')
    const bestBlockResult = await this.bitcoin.getBlock(blockchainResult.bestblockhash)
    if (miningResult.data) {
      return ProcessResult.bitcoinStats(blockchainResult, miningResultLocal, miningResult.data, bestBlockResult)
    } else {
      return 'Mining data response was empty.'
    }
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
        throw error // Re-throw error
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
      const nextBlockText = (blockInfo.nextblockhash) ? `[${blockInfo.nextblockhash}](${Misc.blockchainExplorerUrl()}/block/${blockInfo.nextblockhash})` : 'N/A'
      return `**Block details for: [${hash}](${Misc.blockchainExplorerUrl()}/block/${hash})**
Block Height: [${blockInfo.height}](${Misc.blockchainExplorerUrl()}/block/${hash})
Confirmations: ${blockInfo.confirmations}
Nr of transactions: ${blockInfo.nTx}
Block time: ${blockDate}
Difficulty: ${blockInfo.difficulty}
Preview block hash: [${blockInfo.previousblockhash}](${Misc.blockchainExplorerUrl()}/block/${blockInfo.previousblockhash})
Next block hash: ${nextBlockText}`
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
        throw error // Re-throw error
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
    try {
      const rates = await this.jsFinance.get('/rates/' + symbol)
      if (rates.data) {
        return ProcessResult.priceOverview(symbol, rates.data)
      } else {
        return 'Empty API response'
      }
    } catch (error) {
      // JS-Finance returns a non 2xx error code
      if (error.response && 'detailed_message' in error.response.data) {
        return 'Error: ' + error.response.data.detailed_message
      } else if (error instanceof RuntimeError) {
        return 'Error: ' + error.message
      } else {
        throw error // Re-throw error
      }
    }
  }

  /**
    * Retrieve latest market statistics
    * @param {String} symbol Crypto symbol
    * @return {Promise} message
  */
  async marketStats (symbol) {
    try {
      const quote = await this.jsFinance.get('/cryptos/quote/' + symbol, {
        params: {
          quote_currency: 'USD'
        }
      })
      const meta = await this.jsFinance.get('/cryptos/meta/' + symbol)
      let rates = null
      try {
        rates = await this.jsFinance.get('/rates/' + symbol)
        rates = rates.data
      } catch (err) {
        // Continue without exchange rates
        console.log('(internal) Could not get exchange rates (symbol: ' + symbol + ') during marketStats().')
      }
      if (quote.data && meta.data) {
        // Note: rates could be an object containing the rates or null
        return ProcessResult.marketStats(symbol, quote.data, meta.data, rates)
      } else {
        return 'Empty API response'
      }
    } catch (error) {
      // JS-Finance returns a non 2xx error code
      if (error.response && 'detailed_message' in error.response.data) {
        return 'Error: ' + error.response.data.detailed_message
      } else if (error instanceof RuntimeError) {
        return 'Error: ' + error.message
      } else {
        throw error // Re-throw error
      }
    }
  }

  /**
   * Giving you a generic market overview of the top 20 coins. We will remove tokens/stable coins from the list.
   * @return {Promise} message
   */
  async marketOverview (limit = 20) {
    const removeCurrencySymbols = ['USDT', 'USDC', 'BUSD', 'DAI', 'SHIB', 'UNI', 'WBTC', 'LEO', 'FTT', 'LINK', 'CRO', 'APE', 'MANA', 'SAND', 'AXS', 'QNT', 'AAVE', 'TUSD', 'MKR', 'OKB', 'KCS', 'USDP', 'RUNE', 'BTT', 'CHZ', 'GRT', 'LDO', 'USDD', 'CRV']
    // Retrieve the limit size + the array size of the currency we filter out (eg. to be able to still have 20 items to return)
    const listingResults = await this.jsFinance.get('/cryptos', {
      params: {
        quote_currency: 'USD',
        limit: limit + removeCurrencySymbols.length
      }
    })
    // Filter-out the crypto currencies we don't want to list (like tokens and stable coins)
    const listingResultsFiltered = listingResults.filter((value) => {
      return !(removeCurrencySymbols).includes(value.symbol)
    })
    // Limit the array
    if (listingResultsFiltered.length > limit) { listingResultsFiltered.splice(limit) }
    return ProcessResult.marketOverview(listingResultsFiltered)
  }

  /**
   * Giving you a detailed market overview of the top 25 tokens & coins
   * @return {Promise} message
   */
  async detailedMarketOverview (limit = 25) {
    const listingResults = await this.jsFinance.get('/cryptos', {
      params: {
        quote_currency: 'USD',
        limit: limit
      }
    })
    return ProcessResult.detailedMarketOverview(listingResults)
  }
}

module.exports = Fetcher
