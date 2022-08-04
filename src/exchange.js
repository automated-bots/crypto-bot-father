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
}

module.exports = Exchange
