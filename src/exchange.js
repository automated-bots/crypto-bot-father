const axios = require('axios')
const RuntimeError = require('./runtime-error')

class Exchange {
  /**
   * Constructor
   * @param {string} coinMarketAPIToken Secret API token of coinmarketcap.com
   */
  constructor (coinMarketAPIToken) {
    // Exchange WhatToMine
    this.whattomine_api = 'https://whattomine.com/coins/1.json'
    // CoinBase Exchange
    this.coinbase_api = 'https://api.coinbase.com/v2/exchange-rates?currency='
    // CoinMarketCap API
    this.coinmarket = axios.create({
      baseURL: 'https://pro-api.coinmarketcap.com/v1',
      timeout: 10000,
      headers: {
        'X-CMC_PRO_API_KEY': coinMarketAPIToken
      }
    })
  }

  /**
   * Get exchange rates from coinbase.com. No authentication required.
   *
   * @param symbol Crypto symbol to get currency rates for
   * @return {Promise} Axios promise (example of data: {'USD': '631.0', 'EUR': '714.4', 'BTH': '0.021'})
   */
  getExchangeRates (symbol) {
    return axios.get(this.coinbase_api + symbol)
      .then(response => {
        return Promise.resolve(response.data.data.rates)
      })
  }

  /**
   * Get lastest prices (quotes) from CoinMarketCap, provide the symbol as input.
   *
   * @param symbol Crypto symbol
   * @return {Promise} Axios promise
   */
  getLatestPrices (symbol) {
    return this.coinmarket.get('/cryptocurrency/quotes/latest', {
      params: {
        symbol: symbol,
        aux: 'num_market_pairs,cmc_rank,date_added,tags,platform,max_supply,circulating_supply,total_supply,' +
          'market_cap_by_total_supply,volume_24h_reported,volume_7d,volume_7d_reported,volume_30d,volume_30d_reported,is_active,is_fiat'
      }
    })
      .then(response => {
        const symbolUpper = symbol.toUpperCase()
        if (symbolUpper in response.data.data) {
          return Promise.resolve(response.data.data[symbolUpper])
        } else {
          return Promise.reject(new RuntimeError('Symbol you searched for is not found.'))
        }
      })
  }

  /**
   * Get exchange info from Whattomine.com
   *
   * @return {Promise} Axios promise (block_time, block_reward, difficulty24, exchange_rate, exchange_rate24, market_cap)
   */
  getExchangeInfo () {
    return axios.get(this.whattomine_api)
      .then(response => {
        return Promise.resolve(response.data)
      })
  }
}

module.exports = Exchange
