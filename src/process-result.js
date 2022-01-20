const { table, getBorderCharacters } = require('table')
const Misc = require('./miscellaneous')

// Constants
const COINMARKET_URL = 'https://coinmarketcap.com'

/**
 * Static methods to help processing the result data.
 * Especially useful for big message that also requires pre-processing.
 */
class ProcessResult {
  static priceOverview (symbol, quoteResult, rateResult) {
    const euroPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.EUR))
    const poundSterlingPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.GBP))
    const japaneseYenPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.JPY))
    const swissFrancPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.CHF))
    const australianDollarPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.AUD))
    const canadianDollarPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.CAD))
    const chineseRenminbiPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.CNH))
    const hongKongDollarPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.HKD))
    const bitcoinPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.BTC), 8)
    const usdcPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.USDC))
    const ustPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.UST))
    const ethereumPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.ETH), 6)
    const solanaPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.SOL), 5)
    const cardanoPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.ADA))
    const polkadotPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.DOT), 5)
    const avalanchePrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.AVAX), 5)
    const chainlinkPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.LINK), 5)
    const litecoinPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.LTC), 5)
    const lunaPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.WLUNA), 4)
    const bitcoinCashPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.BCH), 8)
    const dogecoinPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.DOGE))
    const name = (quoteResult.name) ? quoteResult.name : symbol
    const quote = quoteResult.quote.USD
    const dollarPrice = Misc.printCurrencyWithoutSymbol(parseFloat(quote.price))

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
    const euroPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.EUR))
    const btcPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.BTC), 7)
    const ethPrice = Misc.printCurrencyWithoutSymbol(parseFloat(rateResult.ETH), 5)
    const name = (quoteResult.name) ? quoteResult.name : symbol
    const quote = quoteResult.quote.USD
    const circulatingSupply = (quoteResult.circulating_supply) ? quoteResult.circulating_supply.toLocaleString('en') : 'N/A'
    const totalSupply = (quoteResult.total_supply) ? quoteResult.total_supply.toLocaleString('en') : 'N/A'
    const maxSupply = (quoteResult.max_supply) ? quoteResult.max_supply.toLocaleString('en') : 'N/A'
    const dollarPrice = Misc.printCurrencyWithoutSymbol(parseFloat(quote.price))
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
    return `*General coin data for ${name} (${symbol})*
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
Last Hour: ${changeIcon1h} ${percentChange1h}%
Last 24H: ${changeIcon24h} ${percentChange24h}%
Last 7D:  ${changeIcon7d} ${percentChange7d}%
Last 30D: ${changeIcon30d} ${percentChange30d}%
Last 90D: ${changeIcon90d} ${percentChange90d}%`
  }

  static bitcoinStats (blockchainResult, miningResult, exchangeResult, bestBlockResult) {
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

  static marketOverview (listingResults) {
    const config = {
      border: getBorderCharacters('ramac'),
      columnDefault: {
        paddingLeft: 0,
        paddingRight: 0
      },
      drawHorizontalLine: (lineIndex, rowCount) => {
        return lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount
      }
    }
    let text = '*Crypto Market Overview (coins only)*\n'
    const tableData = []
    tableData.push(['Nr', 'Symbl', '$ Price', '%24H', '%7D', '$ Cap', '$Vol24H'])
    for (const coin of listingResults) {
      const quote = coin.quote.USD
      const dollarPrice = Misc.printCurrencyWithoutSymbol(parseFloat(quote.price))
      const percentChange24h = parseFloat(quote.percent_change_24h).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const percentChange7d = parseFloat(quote.percent_change_7d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const marketCap = Misc.printCurrencyNotationCompactWithoutSymbol(parseFloat(quote.market_cap))
      const volume24h = Misc.printCurrencyNotationCompactWithoutSymbol(parseFloat(quote.volume_24h))
      tableData.push([coin.cmc_rank, coin.symbol, dollarPrice, percentChange24h, percentChange7d, marketCap, volume24h])
    }
    text += '```\n' + table(tableData, config) + '\n```'
    return text
  }

  static detailedMarketOverview (listingResults) {
    const config = {
      border: getBorderCharacters('ramac'),
      columnDefault: {
        paddingLeft: 1,
        paddingRight: 1
      },
      header: {
        alignment: 'center',
        content: 'Detailed Crypto Market Overview\nBetter use your desktop to see the table.'
      },
      drawHorizontalLine: (lineIndex, rowCount) => {
        return lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount
      }
    }
    let text = ''
    const tableData = []
    tableData.push(['Nr', 'Symbol', '$ Price', '%24H', '%7D', '%30D', '90D', '$ Cap', '$Vol24H', '%Dominance', 'Max Supply', 'Circul. Supply'])
    for (const coin of listingResults) {
      const quote = coin.quote.USD
      const dollarPrice = Misc.printCurrencyWithoutSymbol(parseFloat(quote.price))
      const percentChange24h = parseFloat(quote.percent_change_24h).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const percentChange7d = parseFloat(quote.percent_change_7d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const percentChange30d = parseFloat(quote.percent_change_30d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const percentChange90d = parseFloat(quote.percent_change_90d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const marketCap = Misc.printCurrencyNotationCompactWithoutSymbol(parseFloat(quote.market_cap))
      const volume24h = Misc.printCurrencyNotationCompactWithoutSymbol(parseFloat(quote.volume_24h))
      const marketCapDominance = parseFloat(quote.market_cap_dominance).toLocaleString('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
      const maxSupply = Misc.printCurrencyNotationCompactWithoutSymbol(parseFloat(coin.max_supply))
      const circulatingSupply = Misc.printCurrencyNotationCompactWithoutSymbol(parseFloat(coin.circulating_supply))
      tableData.push([coin.cmc_rank, coin.symbol, dollarPrice, percentChange24h, percentChange7d, percentChange30d, percentChange90d, volume24h, marketCap, marketCapDominance, maxSupply, circulatingSupply])
    }
    text += '```\n' + table(tableData, config) + '\n```'
    return text
  }
}

module.exports = ProcessResult
