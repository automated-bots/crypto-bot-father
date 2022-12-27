const Misc = require('./miscellaneous')

class Telegram {
  /**
   * Constructor
   * @param {Object} bot Telegram bot object
   * @param {Object} fetcher fetcher object
   */
  constructor (bot, fetcher) {
    this.bot = bot
    this.fetcher = fetcher
  }

  /**
   * Send message to Telegram bot
   * @param {Number} chatId Telegram chat ID
   * @param {String} message Message string
   * @param {Object} options Telegram chat options (optional)
   */
  sendMessage (chatId, message, options = { parse_mode: 'Markdown', disable_web_page_preview: true }) {
    this.bot.sendMessage(chatId, message, options)
  }

  /**
   * Telegram commands
   */
  setCommands () {
    // help command - show available commands
    this.bot.onText(/[/|!]help/, msg => {
      const text = `
General:
  /help - Show help output
  /price <symbol> [<quote_symbol>] - Get latest crypto price (default BCH)
  /detailedprice <symbol> - Get latest detailed price overview (default BCH)
  /stats <symbol> - Get latest market statistics (default BCH)
  /overview [<limit>] - General crypto market overview, limit is optional
  /detailedoverview [<limit>] - Detailed crypto market overview, limit is optional

Bitcoin Cash:
  /bchstatus - Retrieve Bitcoin Cash Node info
  /bchnetwork - Get Bitcoin Cash Network info
  /bchinfo - Get Bitcoin Cash blockchain, mining and exchange stats
  /bchfee - Get fee estimation
  /bchlastblocks - Get the last 10 blocks on Bitcoin Cash network
  /bchtransaction <hash> - Get Bitcoin Cash transaction details
  /bchaddress <address> - Get Bitcoin Cash address details
  /bchtransactions <address> - Get last 10 Bitcoin Cash transactions from an address
  /bchblock <hash> - Get Bitcoin Cash block details

More info:
  /why - Why Bitcoin?
  /what - What is Bitcoin?
  /how - How does Bitcoin work?
  /age - How long does Bitcoin exists?`
      this.sendMessage(msg.chat.id, text)
    })

    // price command (/price): default Bitcoin Cash
    this.bot.onText(/^[/|!]price\S*$/, msg => {
      // Fall-back to Bitcoin Cash (symbol: BCH)
      this.fetcher.priceQuotes('BCH')
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // price command (/price <symbol> [<quote_symbol>]) - provide your own base symbol, and optionally a second parameter as the quote symbol
    this.bot.onText(/[/|!]price@?\S* (\w+) ?(\w+)?/, (msg, match) => {
      const symbol = match[1].trim()
      let quoteSymbol = null
      if (typeof match[2] !== 'undefined') {
        quoteSymbol = match[2].trim()
      }
      this.fetcher.priceQuotes(symbol, quoteSymbol)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // detailedprice command (/detailedprice): default Bitcoin Cash
    this.bot.onText(/^[/|!]detailedprice\S*$/, msg => {
      // Fall-back to Bitcoin Cash (symbol: BCH)
      this.fetcher.detailedPriceQuotes('BCH')
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // detailedprice command (/detailedprice <symbol>) - provide your own base symbol
    this.bot.onText(/[/|!]detailedprice@?\S* (\w+)/, (msg, match) => {
      const symbol = match[1].trim()
      this.fetcher.detailedPriceQuotes(symbol)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // stats command (/stats): default Bitcoin Cash
    this.bot.onText(/^[/|!]stats\S*$/, msg => {
      // Fall-back to Bitcoin Cash (symbol: BCH)
      this.fetcher.marketStats('BCH')
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // stats command (/stats <symbol>) - provide your own symbol
    this.bot.onText(/[/|!]stats@?\S* (\w+)/, (msg, match) => {
      const symbol = match[1].trim()
      this.fetcher.marketStats(symbol)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // Market overview command (/overview)
    this.bot.onText(/^[/|!]overview\S*$/, msg => {
      this.fetcher.marketOverview()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // Market overview command (/overview) - in-/decrease limit to coins
    this.bot.onText(/[/|!]overview@?\S* (\d+)/, (msg, match) => {
      const limit = parseInt(match[1].trim())
      if (isNaN(limit)) {
        this.sendMessage(msg.chat.id, 'Error: Provide a number as argument.')
      } else {
        if (limit <= 0) {
          this.sendMessage(msg.chat.id, 'Error: A number above the 0 will help. Try again.')
        } else if (limit > 50) {
          this.sendMessage(msg.chat.id, 'Error: Let\'s keep the overview limited to 50 results. Try again.')
        } else {
          this.fetcher.marketOverview(limit)
            .then(message => this.sendMessage(msg.chat.id, message))
            .catch(error => console.error(error))
        }
      }
    })

    // Detailed market overview command (/detailedoverview)
    this.bot.onText(/^[/|!]detailedoverview\S*$/, msg => {
      this.fetcher.detailedMarketOverview()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // Detailed market overview command (/detailedoverview) - in-/decrease limit to coins
    this.bot.onText(/[/|!]detailedoverview@?\S* (\d+)/, (msg, match) => {
      const limit = parseInt(match[1].trim())
      if (isNaN(limit)) {
        this.sendMessage(msg.chat.id, 'Error: Provide a number as argument.')
      } else {
        if (limit <= 0) {
          this.sendMessage(msg.chat.id, 'Error: A number above the 0 will help. Try again.')
        } else if (limit > 50) {
          this.sendMessage(msg.chat.id, 'Error: Let\'s keep the overview limited to 50 results. Try again.')
        } else {
          this.fetcher.detailedMarketOverview(limit)
            .then(message => this.sendMessage(msg.chat.id, message))
            .catch(error => console.error(error))
        }
      }
    })

    // Bitcoin cash node status command (/bchstatus)
    this.bot.onText(/[/|!]bchstatus/, msg => {
      this.fetcher.bitcoinStatus()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // Bitcoin network command (/bchnetwork)
    this.bot.onText(/[/|!]bchnetwork/, msg => {
      this.fetcher.bitcoinNetworkInfo()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => {
          console.error(error)
          this.sendMessage(msg.chat.id, 'Error: Could not fetch network info, still verifying blocks... Or can\'t connect to the Bitcoin Cash Node (BCHN) API.')
        })
    })

    // Bitcoin information command (/bchinfo)
    this.bot.onText(/[/|!]bchinfo/, msg => {
      this.fetcher.bitcoinInfo()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // Bitcoin estimate fee command (/bchfee)
    this.bot.onText(/[/|!]bchfee/, msg => {
      this.fetcher.bitcoinEstimateFee()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    this.bot.onText(/^[/|!]bchaddress\S*$/, msg => {
      this.sendMessage(msg.chat.id, 'Error: Provide at least the Bitcoin Cash address as argument: /bchaddress <bitcoincash:address>')
    })

    // address command (/bchaddress <address>)
    this.bot.onText(/[/|!]bchaddress@?\S* (.+)/, (msg, match) => {
      const address = match[1].trim()
      this.fetcher.bitcoinAddress(address)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    this.bot.onText(/^[/|!]bchtransaction\S*$/, msg => {
      this.sendMessage(msg.chat.id, 'Error: Provide at least the Bitcoin Cash transaction hash as argument: /bchtransaction <hash>')
    })

    this.bot.onText(/[/|!]bchtransaction@?\S* (\w+)/, (msg, match) => {
      const hash = match[1].trim()
      // TODO: Improve details like fee & total transaction amounts
      this.fetcher.bitcoinTransaction(hash)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // transactions command (/bchtransactions <address>)
    this.bot.onText(/[/|!]bchtransactions@?\S* (\w+)/, (msg, match) => {
      const address = match[1].trim()
      // TODO: Fully missing
      this.fetcher.bitcoinTransactions(address)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    this.bot.onText(/^[/|!]bchblock\S*$/, msg => {
      this.sendMessage(msg.chat.id, 'Error: Provide at least the Bitcoin Cash block hash as argument: /bchblock <hash>')
    })

    // Bitcoin block command (/bchblock <hash>)
    this.bot.onText(/[/|!]bchblock@?\S* (\w+)/, (msg, match) => {
      const hash = match[1].trim()
      if (Misc.isSha256(hash)) {
        // Retrieved block by hash (sha256)
        this.fetcher.bitcoinBlock(hash)
          .then(message => this.sendMessage(msg.chat.id, message))
          .catch(error => console.error(error))
      } else {
        // TODO: Retrieve by block hash
        this.sendMessage(msg.chat.id, 'Info: Please provide a block hash, other parameters are not yet supported.')
      }
    })

    // lastblocks command (/bchlastblocks)
    // TODO: Implemented getLastBlocks
    this.bot.onText(/[/|!]bchlastblocks/, msg => {
      this.sendMessage(msg.chat.id, '**Not yet implemented**')
    })

    // top10 command (/bchtop10)
    // TODO: implement getTop10BiggestTransactions
    this.bot.onText(/[/|!]bchtop10/, msg => {
      this.sendMessage(msg.chat.id, 'Not yet implemented')
    })

    // Why is Bitcoin created?
    this.bot.onText(/^[/|!]why\S*$/, msg => {
      this.sendMessage(msg.chat.id, `
Bitcoin Cash is P2P electronic cash that is valuable over legacy systems because of the monetary autonomy it brings to its users. 

Bitcoin seeks to address the root problem with conventional currency: all the trust that's required to make it work --
Not that justified trust is a bad thing, but trust makes systems brittle, opaque, and costly to operate. 

Trust failures result in systemic collapses, trust curation creates inequality and monopoly lock-in, 
and naturally arising trust choke-points can be abused to deny access to due process. 
Through the use of cryptographic proof, decentralized networks and open-source software Bitcoin Cash minimizes and replaces these trust costs.

[Read more about why Bitcoin Cash](https://bitcoincash.org/#why)`)
    })

    // What is Bitcoin?
    this.bot.onText(/^[/|!]what\S*$/, msg => {
      this.sendMessage(msg.chat.id, 'Bitcoin Cash (BCH) is a peer-to-peer currency. Peer-to-peer means that no central authority issues new money or tracks transactions. These tasks are managed collectively by the network.')
    })

    // How does Bitcoin work?
    this.bot.onText(/^[/|!]how\S*$/, msg => {
      this.sendMessage(msg.chat.id, `
Bitcoin uses public-key cryptography, peer-to-peer networking, and proof-of-work to process and verify payments.

Bitcoins are sent (or signed over) from one address to another with each user potentially having many, many addresses. 
Each payment transaction is broadcast to the network and included in the blockchain so that the included bitcoins cannot be spent twice. 
After an hour or two, each transaction is locked in time by the massive amount of processing power that continues to extend the blockchain.

Using these techniques, Bitcoin provides a fast and extremely reliable payment network that anyone can use.`)
    })

    this.bot.onText(/^[/|!]age\S*$/, msg => {
      const message = this.fetcher.bitcoinAge()
      this.sendMessage(msg.chat.id, message)
    })

    // Give FAQ Link
    /* this.bot.onText(/^[/|!]faq\S*$/, msg => {
      this.sendMessage(msg.chat.id, '[Read FAQ](' + FAQ_URL + ')')
    }) */

    // Other stuff
    this.bot.on('message', msg => {
      if (msg.text) {
        const name = msg.from.first_name
        if (msg.text.toString() === '!' || msg.text.toString() === '/') {
          this.sendMessage(msg.chat.id, 'Info: Please use /help or !help to get more info.')
        } else if (msg.text.toString().toLowerCase().startsWith('hello') || msg.text.toString().toLowerCase().startsWith('hi')) {
          this.sendMessage(msg.chat.id, 'Welcome ' + name + ' 🤟!')
        } else if (msg.text.toString().toLowerCase().startsWith('bye')) {
          this.sendMessage(msg.chat.id, 'Hope to see you around again, 👋 *Bye ' + name + '* 👋!')
        }
      }
    })
  }
}

module.exports = Telegram
