
// Create our number formatter.

class Misc {
  /**
   * Get blockchain Explorer URL
   * @returns URL
   */
  static blockchainExplorerUrl () {
    return 'https://explorer.melroy.org'
  }

  /**
   * Convert Date object to string
   * @param {Date} - date
   * @return {string} formatted date string
   */
  static printDate (date) {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'medium' }).format(date)
  }

  /**
   * With currency symbol (eg. $243,429.67), default USD
   * @return {string} formatted currency string
   */
  static formatCurrencySymbol (value, currency = 'USD', fractionDigits = 2) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      currencyDisplay: 'narrowSymbol'
    }).format(value)
  }

  /**
   * Using ISO currency  (eg. USD 2,352,712.23), default USD
   * @return {string} formatted currency string
   */
  static printCurrencyCode (value, currency = 'USD', fractionDigits = 2) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      currencyDisplay: 'code'
    }).format(value)
  }

  /**
   * Without any symbol (eg. 23,046.91)
   * @return {string} formatted currency string
   */
  static printCurrencyWithoutSymbol (value, fractionDigits = 2) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      currencyDisplay: 'code'
    }).format(value).replace(/[a-z]{3}/i, '').trim()
  }

  /**
   * Notation compact, display short symbol (eg. $2.5T), default USD
   * @return {string} formatted currency string
   */
  static printCurrencyNotationCompactSymbol (value, currency = 'USD', fractionDigits = 2) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      currencyDisplay: 'narrowSymbol',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value)
  }

  /**
   * Notation compact, display short, without any symbol (eg. 2.5T)
   * @return {string} formatted currency string
   */
  static printCurrencyNotationCompactWithoutSymbol (value, fractionDigits = 2) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      currencyDisplay: 'code',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value).replace(/[a-z]{3}/i, '').trim()
  }

  /**
   * Validate if hash is SHA256
   * @param {string} - hash string
   * @return {Boolean} True if SHA256 otherwise false
   */
  static isSha256 (hash) {
    return hash.match(/^([a-f0-9]{64})$/) != null
  }

  /**
   * Convert timestamp to date (approximately)
   * @param {Date} timestamp
   * @turn {Dict} structure of year, month, day, hour, minute, second
   */
  static timestampToDate (timestamp) {
    let seconds = Math.floor(timestamp / 1000)
    let minutes = Math.floor(seconds / 60)
    seconds = seconds % 60
    let hours = Math.floor(minutes / 60)
    minutes = minutes % 60
    let days = Math.floor(hours / 24)
    hours = hours % 24
    let months = Math.floor(days / 30)
    days = days % 30
    const years = Math.floor(months / 12)
    months = months % 12
    return { year: years, month: months, day: days, hour: hours, minute: minutes, second: seconds }
  }
}

module.exports = Misc
