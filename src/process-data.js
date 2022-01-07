const Misc = require('./miscellaneous')
const COINMARKET_URL = 'https://coinmarketcap.com/currencies'
const DOLLAR_PRICE_FRACTION_DIGITS = 2

class ProcessData {
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
    const text = `*General coin data for ${name}*
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
    return text
  }
}

module.exports = ProcessData
