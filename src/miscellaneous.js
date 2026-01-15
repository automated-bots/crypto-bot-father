import { DateTime } from 'luxon'

export default class Misc {
  /**
   * Get blockchain Explorer URL
   * @returns URL
   */
  static blockchainExplorerUrl() {
    return 'https://bchexplorer.cash'
  }

  /**
   * Convert Date object to string
   * @param {Date} - date
   * @return {string} formatted date string
   */
  static printDate(date) {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'medium' }).format(date)
  }

  /**
   * With currency symbol (eg. $243,429.67), default USD
   * @return {string} formatted currency string
   */
  static formatCurrencySymbol(value, currency = 'USD', fractionDigits = 2) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      currencyDisplay: 'narrowSymbol'
    })
      .format(value)
      .replace('.', '\\.')
  }

  /**
   * Using ISO currency  (eg. USD 2,352,712.23), default USD
   * @return {string} formatted currency string
   */
  static printCurrencyCode(value, currency = 'USD', fractionDigits = 2) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      currencyDisplay: 'code'
    })
      .format(value)
      .replace('.', '\\.')
  }

  /**
   * Without any symbol (eg. 23,046.91)
   * @return {string} formatted currency string
   */
  static printCurrencyWithoutSymbol(value, fractionDigits = 2) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      currencyDisplay: 'code'
    })
      .format(value)
      .replace(/[a-z]{3}/i, '')
      .replace('.', '\\.')
      .trim()
  }

  /**
   * Notation compact, display short symbol (eg. $2.5T), default USD
   * @return {string} formatted currency string
   */
  static printCurrencyNotationCompactSymbol(value, currency = 'USD', fractionDigits = 2) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      currencyDisplay: 'narrowSymbol',
      notation: 'compact',
      compactDisplay: 'short'
    })
      .format(value)
      .replace('.', '\\.')
  }

  /**
   * Notation compact, display short, without any symbol (eg. 2.5T)
   * @return {string} formatted currency string
   */
  static printCurrencyNotationCompactWithoutSymbol(value, fractionDigits = 2) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      currencyDisplay: 'code',
      notation: 'compact',
      compactDisplay: 'short'
    })
      .format(value)
      .replace(/[a-z]{3}/i, '')
      .replace('.', '\\.')
      .trim()
  }

  /**
   * Format a number or a string to a specific min/max fraction digits (digits behind the comma)
   * @param {Number|String} value Value of a string or number
   * @param {Number} minFractionDigits minimum fraction digits (default: 0)
   * @param {Number} maxFractionDigits maximum fraction digits (default: 2)
   * @returns string formatted number
   */
  static printNumber(value, minFractionDigits = 0, maxFractionDigits = 2) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: maxFractionDigits
    })
      .format(value)
      .replace('.', '\\.')
  }

  /**
   * Make the string Telegram friendly
   * @param {String} datetime datetime string
   */
  static printDatetime(datetime) {
    return datetime.replaceAll('-', '\\-').replace('.', '\\.')
  }

  /**
   * Validate if hash is SHA256
   * @param {string} - hash string
   * @return {Boolean} True if SHA256 otherwise false
   */
  static isSha256(hash) {
    return hash.match(/^([a-f0-9]{64})$/) != null
  }

  /**
   * Calculate the exact time difference between the ISO string and now (we can't use timestamps in ms, convertion that to a date is not accurate enough)
   * @param {String} ISODateTime ISO date time string (ISO 8601)
   * @ret {Object} Duration object (includes years, months, weeks, days, hours, minutes, seconds and milliseconds)
   */
  static timeDifference(ISODateTime) {
    const start = DateTime.fromISO(ISODateTime)
    const end = DateTime.now()
    const diff = end.diff(start, ['years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'])
    return diff.toObject()
  }

  /**
   * Convert a string to a safe markdown string for Telegram markdown
   * @param {String} str string input
   * @returns String output, safe for markdown in Telegram
   */
  static makeSafeMarkdownString(str) {
    return str
      .replaceAll('.', '\\.')
      .replaceAll('-', '\\-')
      .replaceAll('!', '\\!')
      .replaceAll('+', '\\+')
      .replaceAll('#', '\\#')
      .replaceAll('*', '\\*')
      .replaceAll('_', '\\_')
      .replaceAll('(', '\\(')
      .replaceAll(')', '\\)')
      .replaceAll('~', '\\~')
      .replaceAll('`', '\\`')
      .replaceAll('|', '\\|')
      .replaceAll('[', '\\[')
      .replaceAll(']', '\\]')
      .replaceAll('<', '\\<')
      .replaceAll('>', '\\>')
      .replaceAll('=', '\\=')
      .replaceAll('{', '\\{')
      .replaceAll('}', '\\}')
      .replaceAll('=', '\\=')
      .replaceAll('=', '\\=')
  }
}
