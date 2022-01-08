const Misc = require('./miscellaneous')

// Constants
const COINMARKET_URL = 'https://coinmarketcap.com/currencies'
const DOLLAR_PRICE_FRACTION_DIGITS = 2

/**
 * Static methods to help processing the result data.
 * Especially useful for big message that also requires pre-processing.
 */
class ProcessResult {
  static price (symbol, quoteResult, rateResult) {
    const euroPrice = parseFloat(rateResult.EUR).toFixed(2)
    const btcPrice = parseFloat(rateResult.BTC).toFixed(5)
    const ethPrice = parseFloat(rateResult.ETH).toFixed(5)
    const name = (quoteResult.name) ? quoteResult.name : symbol
    const quote = quoteResult.quote.USD
    const circulatingSupply = (quoteResult.circulating_supply) ? quoteResult.circulating_supply.toLocaleString('en') : 'N/A'
    const totalSupply = (quoteResult.total_supply) ? quoteResult.total_supply.toLocaleString('en') : 'N/A'
    const maxSupply = (quoteResult.max_supply) ? quoteResult.max_supply.toLocaleString('en') : 'N/A'
    const dollarPrice = quote.price.toLocaleString('en', { maximumFractionDigits: DOLLAR_PRICE_FRACTION_DIGITS })
    const lastUpdatedQuote = Misc.printDate(new Date(quote.last_updated))
    const marketCap = parseFloat(quote.market_cap).toLocaleString('en', { maximumFractionDigits: 0 })
    const volume24h = parseFloat(quote.volume_24h).toLocaleString('en', { maximumFractionDigits: 0 })
    const volume7d = parseFloat(quote.volume_7d).toLocaleString('en', { maximumFractionDigits: 0 })
    const volume30d = parseFloat(quote.volume_30d).toLocaleString('en', { maximumFractionDigits: 0 })
    const percentChange1h = parseFloat(quote.percent_change_1h).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const percentChange24h = parseFloat(quote.percent_change_24h).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const percentChange7d = parseFloat(quote.percent_change_7d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const percentChange30d = parseFloat(quote.percent_change_30d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const percentChange90d = parseFloat(quote.percent_change_90d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const changeIcon1h = (Math.sign(quote.percent_change_1h) === 1) ? '🔼' : '🔽'
    const changeIcon24h = (Math.sign(quote.percent_change_24h) === 1) ? '🔼' : '🔽'
    const changeIcon7d = (Math.sign(quote.percent_change_7d) === 1) ? '🔼' : '🔽'
    const changeIcon30d = (Math.sign(quote.percent_change_30d) === 1) ? '🔼' : '🔽'
    const changeIcon90d = (Math.sign(quote.percent_change_90d) === 1) ? '🔼' : '🔽'
    return `*General coin data for ${name}*
Rank: [#${quoteResult.cmc_rank}](${COINMARKET_URL})
Circulating supply: ${circulatingSupply} ${symbol}s
Total supply: ${totalSupply} ${symbol}s
Max. supply: ${maxSupply} ${symbol}s
Market Cap: $${marketCap}

*Price*
Price: 1 ${symbol} = ${dollarPrice} USD
Price: 1 ${symbol} = ${euroPrice} EUR
Price: 1 ${symbol} = ${btcPrice} BTC
Price: 1 ${symbol} = ${ethPrice} ETH
Last updated: ${lastUpdatedQuote}

*Trading Volume*
Volume 24H: ${volume24h} USD
Volume 7D: ${volume7d} USD
Volume 30D: ${volume30d} USD

*Change*
Last Hour: ${percentChange1h}% ${changeIcon1h}
Last 24H: ${percentChange24h}% ${changeIcon24h}
Last 7D:  ${percentChange7d}% ${changeIcon7d}
Last 30D: ${percentChange30d}% ${changeIcon30d}
Last 90D: ${percentChange90d}% ${changeIcon90d}`
  }

  static stats (blockchainResult, miningResult, exchangeResult) {
    const hashrateth = (parseFloat(miningResult.networkhashps) / 1000.0 / 1000.0 / 1000.0 / 1000.0).toFixed(2)
    const medianTime = Misc.printDate(new Date(blockchainResult.mediantime * 1000))
    const marketCap = exchangeResult.market_cap.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const difficulty = parseFloat(blockchainResult.difficulty).toLocaleString('en', { maximumFractionDigits: 2 })
    const difficulty24h = parseFloat(exchangeResult.difficulty24).toLocaleString('en', { maximumFractionDigits: 2 })
    const difficulty3d = parseFloat(exchangeResult.difficulty3).toLocaleString('en', { maximumFractionDigits: 2 })
    const difficulty7d = parseFloat(exchangeResult.difficulty7).toLocaleString('en', { maximumFractionDigits: 2 })
    const blockTimeMin = Math.floor(parseFloat(exchangeResult.block_time) / 60)
    const blockTimeSec = (((parseFloat(exchangeResult.block_time) / 60) % 2) * 60).toFixed(0)
    const exchangeRate = parseFloat(exchangeResult.exchange_rate).toFixed(2)
    const exchangeRate24h = parseFloat(exchangeResult.exchange_rate24).toFixed(2)
    const exchangeRate3d = parseFloat(exchangeResult.exchange_rate3).toFixed(2)
    const exchangeRate7d = parseFloat(exchangeResult.exchange_rate7).toFixed(2)
    return `*General* 🖥
Last block: ${medianTime}
Median time current best block: ${blockchainResult.mediantime}
Hash best block: ${blockchainResult.bestblockhash}
Net Hashrate: ${hashrateth} Thash/s
Mempool size: ${miningResult.pooledtx}
Market capital: ${marketCap}

*Difficulty* 🤯
Difficulty: ${difficulty}
Difficulty 24 hours avg: ${difficulty24h}
Difficulty 3 days avg: ${difficulty3d}
Difficulty 7 days avg: ${difficulty7d}

*Reward* 🤑
Block time: ${blockTimeMin}m ${blockTimeSec}s
Block reward: ${exchangeResult.block_reward} BTC
Block reward 24 hours avg: ${exchangeResult.block_reward24} BTC
Block reward 3 days avg: ${exchangeResult.block_reward3} BTC

*Exchange* 💱
Exchange rate: ${exchangeRate} BTC-USD
Exchange rate 24 hours avg: ${exchangeRate24h} BTC-USD
Exchange rate 3 days avg: ${exchangeRate3d} BTC-USD
Exchange rate 7 days avg: ${exchangeRate7d} BTC-USD`
  }
}

module.exports = ProcessResult
