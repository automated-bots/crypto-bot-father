const Misc = require('./miscellaneous')

// Constants
const COINMARKET_URL = 'https://coinmarketcap.com'
const DOLLAR_PRICE_FRACTION_DIGITS = 2

/**
 * Static methods to help processing the result data.
 * Especially useful for big message that also requires pre-processing.
 */
class ProcessResult {
  static priceOverview (symbol, quoteResult, rateResult) {
    const euroPrice = parseFloat(rateResult.EUR).toFixed(2)
    const poundSterlingPrice = parseFloat(rateResult.GBP).toFixed(2)
    const japaneseYenPrice = parseFloat(rateResult.JPY).toFixed(2)
    const swissFrancPrice = parseFloat(rateResult.CHF).toFixed(2)
    const australianDollarPrice = parseFloat(rateResult.AUD).toFixed(2)
    const canadianDollarPrice = parseFloat(rateResult.CAD).toFixed(2)
    const chineseRenminbiPrice = parseFloat(rateResult.CNH).toFixed(2)
    const hongKongDollarPrice = parseFloat(rateResult.HKD).toFixed(2)
    const bitcoinPrice = parseFloat(rateResult.BTC).toFixed(8)
    const usdcPrice = parseFloat(rateResult.USDC).toFixed(2)
    const ustPrice = parseFloat(rateResult.UST).toFixed(2)
    const ethereumPrice = parseFloat(rateResult.ETH).toFixed(5)
    const solanaPrice = parseFloat(rateResult.SOL).toFixed(5)
    const cardanoPrice = parseFloat(rateResult.ADA).toFixed(2)
    const polkadotPrice = parseFloat(rateResult.DOT).toFixed(5)
    const avalanchePrice = parseFloat(rateResult.AVAX).toFixed(5)
    const chainlinkPrice = parseFloat(rateResult.LINK).toFixed(5)
    const litecoinPrice = parseFloat(rateResult.LTC).toFixed(5)
    const lunaPrice = parseFloat(rateResult.WLUNA).toFixed(3)
    const bitcoinCashPrice = parseFloat(rateResult.BCH).toFixed(5)
    const dogecoinPrice = parseFloat(rateResult.DOGE).toFixed(2)
    const name = (quoteResult.name) ? quoteResult.name : symbol
    const quote = quoteResult.quote.USD
    const dollarPrice = quote.price.toLocaleString('en', { maximumFractionDigits: DOLLAR_PRICE_FRACTION_DIGITS })

    return `*Current prices of ${name} (${symbol}) in fiat*
 • ${dollarPrice} USD
 • ${euroPrice} EUR
 • ${poundSterlingPrice} GBP
 • ${japaneseYenPrice} JPY
 • ${swissFrancPrice} CHF
 • ${australianDollarPrice} AUD
 • ${canadianDollarPrice} CAD
 • ${chineseRenminbiPrice} CNH
 • ${hongKongDollarPrice} HKD

*Current prices of ${name} in crypto valuta*
• ${bitcoinPrice} [BTC](${COINMARKET_URL}/currencies/bitcoin)
• ${usdcPrice} [USDC](${COINMARKET_URL}/currencies/usd-coin)
• ${ustPrice} [UST](${COINMARKET_URL}/currencies/terrausd)
• ${ethereumPrice} [ETH](${COINMARKET_URL}/currencies/ethereum)
• ${solanaPrice} [SOL](${COINMARKET_URL}/currencies/solana)
• ${cardanoPrice} [ADA](${COINMARKET_URL}/currencies/cardano)
• ${polkadotPrice} [DOT](${COINMARKET_URL}/currencies/polkadot-new)
• ${avalanchePrice} [AVAX](${COINMARKET_URL}/currencies/avalanche)
• ${chainlinkPrice} [LINK](${COINMARKET_URL}/currencies/chainlink)
• ${litecoinPrice} [LTC](${COINMARKET_URL}/currencies/litecoin)
• ${lunaPrice} [WLUNA](${COINMARKET_URL}/currencies/terra-luna)
• ${bitcoinCashPrice} [BCH](${COINMARKET_URL}/currencies/bitcoin-cash)
• ${dogecoinPrice} [DOGE](${COINMARKET_URL}/currencies/dogecoin)`
  }

  static marketStats (symbol, quoteResult, rateResult) {
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
Rank: #${quoteResult.cmc_rank}
Circulating supply: ${circulatingSupply} ${symbol}s
Total supply: ${totalSupply} ${symbol}s
Max. supply: ${maxSupply} ${symbol}s
Market Cap: $${marketCap}
Visit on: [CoinMarketCap](${COINMARKET_URL}/currencies/${quoteResult.slug})

*Price* 💱
Price: 1 ${symbol} = ${dollarPrice} USD
Price: 1 ${symbol} = ${euroPrice} EUR
Price: 1 ${symbol} = ${btcPrice} BTC
Price: 1 ${symbol} = ${ethPrice} ETH
Last updated: ${lastUpdatedQuote}

*Trading Volume* 📊
Volume 24H: ${volume24h} USD
Volume 7D: ${volume7d} USD
Volume 30D: ${volume30d} USD

*Change* 📈
Last Hour: ${percentChange1h}% ${changeIcon1h}
Last 24H: ${percentChange24h}% ${changeIcon24h}
Last 7D:  ${percentChange7d}% ${changeIcon7d}
Last 30D: ${percentChange30d}% ${changeIcon30d}
Last 90D: ${percentChange90d}% ${changeIcon90d}`
  }

  static stats (blockchainResult, miningResult, exchangeResult, bestBlockResult) {
    const hashrateth = (parseFloat(miningResult.networkhashps) / 1000.0 / 1000.0 / 1000.0 / 1000.0).toFixed(2)
    const medianTime = Misc.printDate(new Date(blockchainResult.mediantime * 1000))
    const marketCap = exchangeResult.market_cap.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const difficulty = parseFloat(blockchainResult.difficulty).toLocaleString('en', { maximumFractionDigits: 0 })
    const difficulty24h = parseFloat(exchangeResult.difficulty24).toLocaleString('en', { maximumFractionDigits: 0 })
    const difficulty3d = parseFloat(exchangeResult.difficulty3).toLocaleString('en', { maximumFractionDigits: 0 })
    const difficulty7d = parseFloat(exchangeResult.difficulty7).toLocaleString('en', { maximumFractionDigits: 0 })
    const blockTimeMin = Math.floor(parseFloat(exchangeResult.block_time) / 60)
    const blockTimeSec = (((parseFloat(exchangeResult.block_time) / 60) % 2) * 60).toFixed(0)
    const exchangeRate = parseFloat(exchangeResult.exchange_rate).toFixed(2)
    const exchangeRate24h = parseFloat(exchangeResult.exchange_rate24).toFixed(2)
    const exchangeRate3d = parseFloat(exchangeResult.exchange_rate3).toFixed(2)
    const exchangeRate7d = parseFloat(exchangeResult.exchange_rate7).toFixed(2)
    return `*General* 🖥
Last block: ${medianTime}
Median time current best block: ${blockchainResult.mediantime}
Best block height: [${bestBlockResult.height}](${Misc.blockchainExplorerUrl()}/block/${blockchainResult.bestblockhash})
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
Block reward 24H avg: ${exchangeResult.block_reward24} BTC
Block reward 3D avg: ${exchangeResult.block_reward3} BTC

*Exchange* 💱
Exchange rate: ${exchangeRate} BTC/USD
Exchange rate 24H avg: ${exchangeRate24h} BTC/USD
Exchange rate 3D avg: ${exchangeRate3d} BTC/USD
Exchange rate 7D avg: ${exchangeRate7d} BTC/USD`
  }
}

module.exports = ProcessResult
