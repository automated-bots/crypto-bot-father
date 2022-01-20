const axios = require('axios')
const RuntimeError = require('./errors/runtime-error')

class Exchange {
  /**
   * Constructor
   * @param {string} coinMarketAPIToken Secret API token of coinmarketcap.com
   */
  constructor (coinMarketAPIToken) {
    // Exchange WhatToMine
    this.whattomine_api = 'https://whattomine.com/coins'
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
        if ('data' in response.data) {
          if (symbol in response.data.data) {
            return Promise.resolve(response.data.data[symbol])
          } else {
            return Promise.reject(new RuntimeError('Symbol you searched for is not found.'))
          }
        } else {
          let errorMessage = ''
          if ('status' in response.data) {
            errorMessage = ' With error messsage: ' + response.data.status.error_message
          }
          return Promise.reject(new RuntimeError('Something went wrong with getting the data from CoinMarketCap.' + errorMessage))
        }
      })
  }

  /**
   * Get lastest coin market overview (listing) from CoinMarketCap
   * Only listing the top coins (not tokens) by market cap.
   *
   * @param {Number} limit the top x coins by market cap (eg. Top 20, provide: 20)
   * @return {Promise} Axios promise
   */
  getLatestMarketOverview (limit, showOnlyCoins = true) {
    const params = {
      limit: limit,
      aux: 'num_market_pairs,cmc_rank,date_added,tags,platform,max_supply,circulating_supply,total_supply,market_cap_by_total_supply,' +
        'volume_24h_reported,volume_7d,volume_7d_reported,volume_30d,volume_30d_reported,is_market_cap_included_in_calc'
    }
    if (showOnlyCoins) {
      params.cryptocurrency_type = 'coins'
    }
    return this.coinmarket.get('/cryptocurrency/listings/latest', { params: params })
      .then(response => {
        if ('data' in response.data && Array.isArray(response.data.data)) {
          return Promise.resolve(response.data.data)
        } else {
          let errorMessage = ''
          if ('status' in response.data) {
            errorMessage = ' With error messsage: ' + response.data.status.error_message
          }
          return Promise.reject(new RuntimeError('Something went wrong with getting the data from CoinMarketCap.' + errorMessage))
        }
      })
  }

  /**
   * Get Exchange info from Whattomine.com
   *
   * @param {Number} id Whattomine crypto ID
   * @return {Promise} Axios promise (block_time, block_reward, difficulty24, exchange_rate, exchange_rate24, market_cap)
   */
  getExchangeInfo (id) {
    return axios.get(this.whattomine_api + '/' + id + '.json')
      .then(response => {
        return Promise.resolve(response.data)
      })
  }
}

module.exports = Exchange
