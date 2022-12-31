const axios = require('axios')
const ProcessResult = require('./process-result')
const RuntimeError = require('./errors/runtime-error')
const Misc = require('./miscellaneous')

const CHART_IMAGE_API_KEY = process.env.CHART_IMAGE_API_KEY || ''

/**
 * Fetches or calculates the data we need from all kind of sources
 */
class Fetcher {
  constructor (bitcoinCash, fulcrum) {
    this.bitcoinCash = bitcoinCash
    this.fulcrum = fulcrum
    this.jsFinance = axios.create({
      baseURL: 'https://finance.melroy.org/v1',
      timeout: 10000
    })
    this.explorer = axios.create({
      baseURL: 'https://explorer.melroy.org/api/v1',
      timeout: 10000
    })
    this.chart = axios.create({
      baseURL: 'https://api.chart-img.com/v1',
      headers: {
        Authorization: 'Bearer ' + CHART_IMAGE_API_KEY
      },
      responseType: 'stream',
      timeout: 10000
    })
  }

  /**
   * How long does bitcoin exists (since first genesis block)
   * Source: https://explorer.bitcoinunlimited.info/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
   * Source: https://explorer.bitcoinunlimited.info/block/000000000000000000651ef99cb9fcbe0dadde1d424bd9f15ff20136191a5eec
   * @returns message string
   */
  bitcoinAge () {
    const ageGenesis = Misc.timestampToDate(Date.now() - 1231002905000) // timestamp ms since creation of the genesis block
    const ageFork = Misc.timestampToDate(Date.now() - 1501603961000) // timestamp ms since creation of the Bitcoin cash fork
    return `Bitcoin (Cash) age: ${ageGenesis.year} years, ${ageGenesis.month} months, ${ageGenesis.day} days, since the [first mined block](https://explorer.melroy.org/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f).\n
Bitcoin Cash was a result of developers not agreeing with Satoshi's plan in 2017.\n
Bitcoin Cash fork: ${ageFork.year} years, ${ageFork.month} months, ${ageFork.day} days, ago since the [first block after the hard fork](https://explorer.melroy.org/block/000000000000000000651ef99cb9fcbe0dadde1d424bd9f15ff20136191a5eec).\n
A large portion of the Bitcoin community, including developers, investors, users, and businesses, still believed in the original vision of Bitcoin -- a low fee, peer to peer electronic cash system that could be used by all the people of the world. Which is now called Bitcoin Cash.`
  }

  /**
   * Retrieve Bitcoin status
   * @returns message
   */
  async bitcoinStatus () {
    let text = ''
    try {
      const networkResult = await this.bitcoinCash.getNetworkInfo()
      text += `
Bitcoin Cash node version: ${networkResult.subversion}
Protocol version: ${networkResult.protocolversion}
\n*Peer info*
Peers connected: ${networkResult.connections}`
    } catch (error) {
      console.error(error)
      text += 'Error: Could not fetch network info!\n'
    }

    try {
      const peerResult = await this.bitcoinCash.getPeerInfo()
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
   * @return message
   */
  async bitcoinNetworkInfo () {
    try {
      const result = await this.bitcoinCash.getNetworkInfo()
      let text = `
*Bitcoin Network Info*
Bitcoin cash node version: ${result.version}
User-agent string: ${result.subversion}
Protocol version: ${result.protocolversion}
Connections: ${result.connections}
P2P active: ${result.networkactive}
Minimum relay fee:  ${result.relayfee} BCH/kB
Minimum charge: ${result.excessutxocharge} BCH
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
      // The Bitcoin cash node returns a 500 HTTP error code
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
   * Retrieve Bitcoin Cash information
   * @returns message
   */
  async bitcoinInfo () {
    const blockchainResult = await this.bitcoinCash.getBlockChainInfo()
    const quote = await this.jsFinance.get('/cryptos/quote/BCH',
      {
        params: {
          quote_currency: 'USD'
        }
      })
    const miningResultLocal = await this.bitcoinCash.getMiningInfo()
    const miningResult = await this.jsFinance.get('/cryptos/mining/BCH')
    const bestBlockResult = await this.bitcoinCash.getBlock(blockchainResult.bestblockhash)
    if (miningResult.data) {
      return ProcessResult.bitcoinCashStats(blockchainResult, quote.data, miningResultLocal, miningResult.data, bestBlockResult)
    } else {
      return 'Mining data response was empty.'
    }
  }

  /**
   * Estimate the Bitcoin Cash fee
   */
  async bitcoinEstimateFee () {
    const estimateFee = await this.bitcoinCash.estimateFee()
    return `Estimated fee: ${estimateFee} BCH/kB`
  }

  /**
   * Retrieve Bitcoin trannsaction details
   * @param {String} hash Bitcoin transaction hash
   * @returns message
   */
  async bitcoinTransaction (hash) {
    try {
      // TODO: Retrieve inputs and outputs to determine fee & amounts
      const rawTransaction = await this.bitcoinCash.getRawTransaction(hash)
      const blockInfo = await this.bitcoinCash.getBlock(rawTransaction.blockhash)
      const transactionDate = Misc.printDate(new Date(rawTransaction.time * 1000))
      const text = `**Transaction details for [${hash}](${Misc.blockchainExplorerUrl()}/tx/${hash})**
Confirmations: ${rawTransaction.confirmations}
Date:  ${transactionDate}
In Block Height: [${blockInfo.height}](${Misc.blockchainExplorerUrl()}/block/${rawTransaction.blockhash}) with ${blockInfo.nTx} transactions`
      return text
    } catch (error) {
      // The Bitcoin cash node returns a 500 HTTP error code
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
      const blockInfo = await this.bitcoinCash.getBlock(hash)
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
      // The Bitcoin cash node returns a 500 HTTP error code
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
   * Retrieve latest Bitcoin Cash blocks
   * @return message
   */
  async bitcoinLatestBlocks () {
    const blocks = await this.explorer.get('/blocks')
    if (blocks.data && Array.isArray(blocks.data) && blocks.data.length >= 8) {
      let returnData = '*Latest 8 blocks:*\n'
      for (let i = 0; i < 8; i++) {
        const block = blocks.data[i]
        const sizeKb = block.size / 1000.0
        const poolName = ('extras' in block && 'pool' in block.extras && 'name' in block.extras.pool) ? block.extras.pool.name : 'Unknown'
        returnData += `• Height: [${block.height}](${Misc.blockchainExplorerUrl()}/block/${block.id}), Pool: ${poolName}, TXs: ${block.tx_count}, Size: ${sizeKb} kB\n`
      }
      return returnData
    } else {
      return 'Something went wrong trying to receive the latest Bitcoin Cash blocks'
    }
  }

  /**
   * Retrieve latest Bitcoin Cash trnasactions
   * @return message
   */
  async bitcoinLatestTransactions () {
    const txs = await this.explorer.get('/mempool/recent')
    if (txs.data && Array.isArray(txs.data) && txs.data.length >= 8) {
      let returnData = '*Latest 8 TXs:*\n'
      for (let i = 0; i < 8; i++) {
        const tx = txs.data[i]
        const txSmall = tx.txid.substring(0, 3) + '...' + tx.txid.substr(tx.txid.length - 3)
        const amount = Misc.printCurrencyWithoutSymbol(tx.value / 100000000.0, 5)
        const fee = Misc.printNumber(tx.fee / tx.size, 0, 2)
        returnData += `• TXID: [${txSmall}](${Misc.blockchainExplorerUrl()}/tx/${tx.txid}), Amount: ${amount} BCH, Fee: ${fee} sat/B\n`
      }
      return returnData
    } else {
      return 'Something went wrong trying to receive the latest Bitcoin Cash transactions'
    }
  }

  /**
   * Retrieve Bitcoin Cash address balance
   * @param {String} address Bitcoin Cash address
   * @return message
   */
  async bitcoinAddressBalance (address) {
    const result = await this.fulcrum.getBalance(address)
    if (result && 'confirmed' in result) {
      const confirmedBch = Misc.printCurrencyWithoutSymbol(result.confirmed / 100000000.0, 8)
      const unconfirmedBch = Misc.printCurrencyWithoutSymbol(result.unconfirmed / 100000000.0, 8)
      return `*Balance:* [${confirmedBch} BCH](${Misc.blockchainExplorerUrl()}/address/${address}) (unconfirmed: ${unconfirmedBch} BCH)`
    } else if (result && 'message' in result) {
      return `Error while retrieving the balance: ${result.message}.`
    } else {
      return 'Something went wrong getting the balance. Please, try again.'
    }
  }

  /**
   * Show latest transactions on address
   * @param {String} hash Bitcoin address
   * @return message
   */
  async bitcoinTransactions (address) {
    // TODO ..
    return 'not yet implemented'
  }

  /**
    * Retrieve latest quote information and exchange rates (fiat + crypto).
    * @param {String} symbol Crypto symbol
    * @param {String} quoteSymbol (Optionally) Quote symbol (eg. USD, EUR, BTC, ADA)
    * @return message
    */
  async priceQuotes (symbol, quoteSymbol = null) {
    try {
      const rates = await this.jsFinance.get('/rates/' + symbol)
      if (rates.data) {
        return ProcessResult.priceOverview(symbol, rates.data, quoteSymbol)
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
    * Retrieve latest detailed quote information and exchange rates (fiat + crypto).
    * @param {String} symbol Crypto symbol
    * @return message
    */
  async detailedPriceQuotes (symbol) {
    try {
      const rates = await this.jsFinance.get('/rates/' + symbol)
      if (rates.data) {
        return ProcessResult.detailedPriceOverview(symbol, rates.data)
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
    * @return message
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
   * @return message
   */
  async marketOverview (limit = 20) {
    const removeCurrencySymbols = ['USDT', 'USDC', 'BUSD', 'DAI', 'SHIB', 'UNI', 'WBTC', 'LEO', 'FTT', 'LINK', 'CRO', 'APE', 'MANA', 'SAND', 'AXS', 'QNT', 'AAVE', 'TUSD', 'MKR', 'OKB', 'KCS', 'USDP', 'RUNE', 'BTT', 'CHZ', 'GRT', 'LDO', 'USDD', 'CRV']
    // Retrieve the limit size + the array size of the currency we filter out (eg. to be able to still have 20 items to return)
    const response = await this.jsFinance.get('/cryptos', {
      params: {
        quote_currency: 'USD',
        limit: limit + removeCurrencySymbols.length
      }
    })
    const listingResults = response.data
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
   * @return message
   */
  async detailedMarketOverview (limit = 25) {
    const response = await this.jsFinance.get('/cryptos', {
      params: {
        quote_currency: 'USD',
        limit: limit
      }
    })
    const listingResults = response.data
    return ProcessResult.detailedMarketOverview(listingResults)
  }

  /**
    * Retrieve TradingView chart
    * @param {String} symbol Crypto symbol
    * @param {String} quoteSymbol (Optionally) Quote symbol (eg. USD)
    * @return {Stream} Image stream data
    */
  async chartImage (symbol, quoteSymbol = 'USD') {
    try {
      const image = await this.chart.get('/tradingview/advanced-chart', {
        params: {
          symbol: symbol + quoteSymbol,
          interval: '4h',
          studies: ['RSI', 'MACD']
        },
        paramsSerializer: {
          indexes: null
        }
      })
      if (image.data) {
        return image.data
      } else {
        return 'Error: Could not find chart data in response'
      }
    } catch (error) {
      // Chart-img.com returns a non 2xx error code
      if (error.response && 'error' in error.response.data) {
        return 'Error: ' + error.response.data.error
      } else if (error.response && 'message' in error.response.data) {
        return 'Error: ' + error.response.data.message
      } else if (error instanceof RuntimeError) {
        return 'Error: ' + error.message
      } else {
        throw error // Re-throw error
      }
    }
  }
}

module.exports = Fetcher
