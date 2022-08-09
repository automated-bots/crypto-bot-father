const { table, getBorderCharacters } = require('table')
const Misc = require('./miscellaneous')

// Constants
const COINMARKET_URL = 'https://coinmarketcap.com'

/**
 * Static methods to help processing the result data.
 * Especially useful for big message that also requires pre-processing.
 */
class ProcessResult {
  static priceOverview (symbol, rates) {
    symbol = symbol.toUpperCase()
    const ratesList = rates.rates
    // Fiat
    const dollarPrice = Misc.printCurrencyWithoutSymbol(ratesList.USD)
    const euroPrice = Misc.printCurrencyWithoutSymbol(ratesList.EUR)
    const poundSterlingPrice = Misc.printCurrencyWithoutSymbol(ratesList.GBP)
    const japaneseYenPrice = Misc.printCurrencyWithoutSymbol(ratesList.JPY)
    const swissFrancPrice = Misc.printCurrencyWithoutSymbol(ratesList.CHF)
    const australianDollarPrice = Misc.printCurrencyWithoutSymbol(ratesList.AUD)
    const canadianDollarPrice = Misc.printCurrencyWithoutSymbol(ratesList.CAD)
    const chineseRenminbiPrice = Misc.printCurrencyWithoutSymbol(ratesList.CNH)
    const hongKongDollarPrice = Misc.printCurrencyWithoutSymbol(ratesList.HKD)
    // Crypto
    const bitcoinPrice = Misc.printCurrencyWithoutSymbol(ratesList.BTC, 8)
    const usdcPrice = Misc.printCurrencyWithoutSymbol(ratesList.USDC)
    const usdtPrice = Misc.printCurrencyWithoutSymbol(ratesList.USDT)
    const busdPrice = Misc.printCurrencyWithoutSymbol(ratesList.BUSD, 4)
    const ethereumPrice = Misc.printCurrencyWithoutSymbol(ratesList.ETH, 6)
    const solanaPrice = Misc.printCurrencyWithoutSymbol(ratesList.SOL, 5)
    const cardanoPrice = Misc.printCurrencyWithoutSymbol(ratesList.ADA)
    const polkadotPrice = Misc.printCurrencyWithoutSymbol(ratesList.DOT, 5)
    const avalanchePrice = Misc.printCurrencyWithoutSymbol(ratesList.AVAX, 5)
    const uniswapPrice = Misc.printCurrencyWithoutSymbol(ratesList.UNI, 5)
    const chainlinkPrice = Misc.printCurrencyWithoutSymbol(ratesList.LINK, 5)
    const litecoinPrice = Misc.printCurrencyWithoutSymbol(ratesList.LTC, 5)
    const bitcoinCashPrice = Misc.printCurrencyWithoutSymbol(ratesList.BCH, 8)
    const dogecoinPrice = Misc.printCurrencyWithoutSymbol(ratesList.DOGE)
    const baseCurrency = (rates.base_currency) ? rates.base_currency : symbol
    const baseName = (rates.base_name) ? rates.base_name : symbol

    return `*Current prices of ${baseName} (${baseCurrency}) in fiat*
 • ${dollarPrice} USD
 • ${euroPrice} EUR
 • ${poundSterlingPrice} GBP
 • ${japaneseYenPrice} JPY
 • ${swissFrancPrice} CHF
 • ${australianDollarPrice} AUD
 • ${canadianDollarPrice} CAD
 • ${chineseRenminbiPrice} CNH
 • ${hongKongDollarPrice} HKD

*Current prices of ${baseName} in crypto valuta*
• ${bitcoinPrice} [BTC](${COINMARKET_URL}/currencies/bitcoin)
• ${ethereumPrice} [ETH](${COINMARKET_URL}/currencies/ethereum)
• ${solanaPrice} [SOL](${COINMARKET_URL}/currencies/solana)
• ${cardanoPrice} [ADA](${COINMARKET_URL}/currencies/cardano)
• ${bitcoinCashPrice} [BCH](${COINMARKET_URL}/currencies/bitcoin-cash)
• ${polkadotPrice} [DOT](${COINMARKET_URL}/currencies/polkadot-new)
• ${avalanchePrice} [AVAX](${COINMARKET_URL}/currencies/avalanche)
• ${uniswapPrice} [UNI](${COINMARKET_URL}/currencies/uniswap)
• ${chainlinkPrice} [LINK](${COINMARKET_URL}/currencies/chainlink)
• ${litecoinPrice} [LTC](${COINMARKET_URL}/currencies/litecoin)
• ${dogecoinPrice} [DOGE](${COINMARKET_URL}/currencies/dogecoin)

*Current price of ${baseName} in stable coins*
• ${usdcPrice} [USDC](${COINMARKET_URL}/currencies/usd-coin)
• ${usdtPrice} [USDT](${COINMARKET_URL}/currencies/tether)
• ${busdPrice} [BUSD](${COINMARKET_URL}/currencies/binance-usd)`
  }

  static marketStats (symbol, quote, meta, rates) {
    symbol = symbol.toUpperCase()
    let exchangeString = ''
    // Fill-in the exchange rates when found
    if (rates) {
      const listRates = rates.rates
      const euroPrice = Misc.printCurrencyWithoutSymbol(listRates.EUR)
      const btcPrice = Misc.printCurrencyWithoutSymbol(listRates.BTC, 7)
      const ethPrice = Misc.printCurrencyWithoutSymbol(listRates.ETH, 5)
      exchangeString = `Price: 1 ${symbol} = ${euroPrice} EUR
Price: 1 ${symbol} = ${btcPrice} BTC
Price: 1 ${symbol} = ${ethPrice} ETH`
    }
    const name = (quote.name) ? quote.name : symbol
    const dollarPrice = Misc.printCurrencyWithoutSymbol(quote.price)
    const circulatingSupply = (meta.circulating_supply) ? meta.circulating_supply.toLocaleString('en') : 'N/A'
    const totalSupply = (meta.total_supply) ? meta.total_supply.toLocaleString('en') : 'N/A'
    const maxSupply = (meta.max_supply) ? meta.max_supply.toLocaleString('en') : 'N/A'
    const marketCap = quote.market_cap.toLocaleString('en', { maximumFractionDigits: 0 })
    const volume24h = quote.volume_24h.toLocaleString('en', { maximumFractionDigits: 0 })
    const volume7d = quote.volume_7d.toLocaleString('en', { maximumFractionDigits: 0 })
    const volume30d = quote.volume_30d.toLocaleString('en', { maximumFractionDigits: 0 })
    const percentChanged1h = quote.percentage_changed_1h.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const percentChanged24h = quote.percentage_changed_24h.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const percentChanged7d = quote.percentage_changed_7d.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const percentChanged30d = quote.percentage_changed_30d.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const percentChanged90d = quote.percentage_changed_90d.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const lastUpdatedQuote = Misc.printDate(new Date(quote.last_updated))
    const changeIcon1h = (Math.sign(quote.percentage_changed_1h) === 1) ? '🔼' : '🔽'
    const changeIcon24h = (Math.sign(quote.percentage_changed_24h) === 1) ? '🔼' : '🔽'
    const changeIcon7d = (Math.sign(quote.percentage_changed_7d) === 1) ? '🔼' : '🔽'
    const changeIcon30d = (Math.sign(quote.percentage_changed_30d) === 1) ? '🔼' : '🔽'
    const changeIcon90d = (Math.sign(quote.percentage_changed_90d) === 1) ? '🔼' : '🔽'
    return `*General coin data for ${name} (${symbol})*
Rank: #${meta.rank}
Circulating supply: ${circulatingSupply} ${symbol}s
Total supply: ${totalSupply} ${symbol}s
Max. supply: ${maxSupply} ${symbol}s
Market Cap: $${marketCap}
Visit on: [CoinMarketCap](${meta.cmc_url})

*Price* 💱
Price: 1 ${symbol} = ${dollarPrice} USD
${exchangeString}
Last updated: ${lastUpdatedQuote}

*Trading Volume* 📊
Volume 24H: ${volume24h} USD
Volume 7D: ${volume7d} USD
Volume 30D: ${volume30d} USD

*Change* 📈
Last Hour: ${changeIcon1h} ${percentChanged1h}%
Last 24H: ${changeIcon24h} ${percentChanged24h}%
Last 7D:  ${changeIcon7d} ${percentChanged7d}%
Last 30D: ${changeIcon30d} ${percentChanged30d}%
Last 90D: ${changeIcon90d} ${percentChanged90d}%`
  }

  static bitcoinStats (blockchainResult, miningResultLocal, miningResult, bestBlockResult) {
    const hashrateth = (miningResultLocal.networkhashps / 1000.0 / 1000.0 / 1000.0 / 1000.0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) // Convert to Tera
    const medianTime = Misc.printDate(new Date(blockchainResult.mediantime * 1000))
    const marketCap = (miningResult.market_cap).toLocaleString('en', { maximumFractionDigits: 0 })
    const difficulty = (blockchainResult.difficulty / 1000.0 / 1000.0).toLocaleString('en', { maximumFractionDigits: 0 }) // Convert to Millions
    const difficulty24h = (miningResult.difficulty24h / 1000.0 / 1000.0).toLocaleString('en', { maximumFractionDigits: 0 }) // Convert to Millions
    const difficulty3d = (miningResult.difficulty3d / 1000.0 / 1000.0).toLocaleString('en', { maximumFractionDigits: 0 }) // Convert to Millions
    const difficulty7d = (miningResult.difficulty7d / 1000.0 / 1000.0).toLocaleString('en', { maximumFractionDigits: 0 }) // Convert to Millions
    const blockTimeMin = Math.floor(miningResult.block_time_seconds / 60)
    const blockTimeSec = (((miningResult.block_time_seconds / 60) % 2) * 60).toFixed(0)
    const exchangeRate = (miningResult.exchange_rate).toFixed(2)
    const exchangeRate24h = (miningResult.exchange_rate24h).toFixed(2)
    const exchangeRate3d = (miningResult.exchange_rate3d).toFixed(2)
    const exchangeRate7d = (miningResult.exchange_rate7d).toFixed(2)
    return `*General* 🖥
Last block: ${medianTime}
Median time current best block: ${blockchainResult.mediantime}
Best block height: [${bestBlockResult.height}](${Misc.blockchainExplorerUrl()}/block/${blockchainResult.bestblockhash})
Net Hashrate: ${hashrateth} Thash/s
Mempool size: ${miningResultLocal.pooledtx}
Market capital: ${marketCap} USD

*Difficulty* 🤯
Difficulty: ${difficulty}M
Difficulty 24 hours avg: ${difficulty24h}M
Difficulty 3 days avg: ${difficulty3d}M
Difficulty 7 days avg: ${difficulty7d}M

*Reward* 🤑
Block time: ${blockTimeMin}m ${blockTimeSec}s
Block reward: ${miningResult.block_reward} BTC
Block reward 24H avg: ${miningResult.block_reward24h} BTC
Block reward 3D avg: ${miningResult.block_reward3d} BTC
Block reward 7D avg: ${miningResult.block_reward7d} BTC

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
      const dollarPrice = Misc.printCurrencyWithoutSymbol(coin.price)
      const percentChange24h = (coin.percentage_changed_24h).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const percentChange7d = (coin.percentage_changed_7d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const marketCap = Misc.printCurrencyNotationCompactWithoutSymbol(coin.market_cap)
      const volume24h = Misc.printCurrencyNotationCompactWithoutSymbol(coin.volume_24h)
      tableData.push([coin.rank, coin.symbol, dollarPrice, percentChange24h, percentChange7d, marketCap, volume24h])
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
        content: 'Detailed Crypto Market Overview\nBetter use your desktop PC to see the table.'
      },
      drawHorizontalLine: (lineIndex, rowCount) => {
        return lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount
      }
    }
    let text = ''
    const tableData = []
    tableData.push(['Nr', 'Symbol', '$ Price', '%24H', '%7D', '%30D', '90D', '$ Cap', '$Vol24H', '%Domin', 'Cir. Supp', 'Max Supp'])
    for (const coin of listingResults) {
      const dollarPrice = Misc.printCurrencyWithoutSymbol(coin.price)
      const percentChange24h = (coin.percentage_changed_24h).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const percentChange7d = (coin.percentage_changed_7d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const percentChange30d = (coin.percentage_changed_30d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const percentChange90d = (coin.percentage_changed_90d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const marketCap = Misc.printCurrencyNotationCompactWithoutSymbol(coin.market_cap)
      const volume24h = Misc.printCurrencyNotationCompactWithoutSymbol(coin.volume_24h)
      const marketCapDominance = (coin.market_cap_dominance).toLocaleString('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
      const circulatingSupply = Misc.printCurrencyNotationCompactWithoutSymbol(coin.circulating_supply)
      const maxSupply = (coin.max_supply) ? Misc.printCurrencyNotationCompactWithoutSymbol(coin.max_supply) : 'N/A'
      tableData.push([coin.rank, coin.symbol, dollarPrice, percentChange24h, percentChange7d, percentChange30d, percentChange90d, volume24h, marketCap, marketCapDominance, circulatingSupply, maxSupply])
    }
    text += '```\n' + table(tableData, config) + '\n```'
    return text
  }
}

module.exports = ProcessResult
