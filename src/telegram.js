const Misc = require('./miscellaneous')

// Constants
const FAQ_URL = 'https://bitcoin.melroy.org/en/faq'

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
  sendMessage (chatId, message, options = { parse_mode: 'markdown', disable_web_page_preview: true }) {
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
  /price <symbol> - Get latest crypto price overview
  /stats <symbol> - Get latest market statistics

Bitcoin:
  /btcstatus - Retrieve Bitcoin Core Deamon info
  /btcnetwork - Get Bitcoin Network info
  /btcinfo - Get Bitcoin blockchain, mining and exchange stats
  /btclastblocks - Get the last 10 blocks on Bitcoin
  /btctransaction <hash> - Get Bitcoin transaction details
  /btcaddress <address> - Get Bitcoin address details
  /btctransactions <address> - Get last 10 Bitcoin transactions from an address
  /btcblock <hash or block height> - Get Bitcoin block details

More info:
  /why - Why Bitcoin?
  /what - What is Bitcoin?
  /how - How does Bitcoin work?
  /age - How long does Bitcoin exists?
  /faq - Frequality Asked Questions`
      this.sendMessage(msg.chat.id, text)
    })

    // price command (/price): default Bitcoin
    this.bot.onText(/^[/|!]price\S*$/, msg => {
      // Fall-back to Bitcoin (symbol: BTC)
      this.fetcher.priceQuotes('BTC')
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // price command (/price <symbol>) - provide your own symbol
    this.bot.onText(/[/|!]price@?\S* (.+)/, (msg, match) => {
      const symbol = match[1].trim()
      this.fetcher.priceQuotes(symbol)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // stats command (/stats): default Bitcoin
    this.bot.onText(/^[/|!]stats\S*$/, msg => {
      // Fall-back to Bitcoin (symbol: BTC)
      this.fetcher.marketStats('BTC')
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // stats command (/stats <symbol>) - provide your own symbol
    this.bot.onText(/[/|!]stats@?\S* (.+)/, (msg, match) => {
      const symbol = match[1].trim()
      this.fetcher.marketStats(symbol)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // Bitcoin core status command (/btcstatus)
    this.bot.onText(/[/|!]btcstatus/, msg => {
      this.fetcher.bitcoinStatus()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // Bitcoin network command (/btcnetwork)
    this.bot.onText(/[/|!]btcnetwork/, msg => {
      this.fetcher.bitcoinNetworkInfo()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => {
          console.error(error)
          this.sendMessage(msg.chat.id, 'Could not fetch network info, still verifying blocks... Or can\'t connect to the Bitcoin Core Daemon API.')
        })
    })

    // Bitcoin information command (/btcinfo)
    this.bot.onText(/[/|!]btcinfo/, msg => {
      this.fetcher.bitcoinInfo()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // address command (/btcaddress <address>)
    this.bot.onText(/[/|!]btcaddress@?\S* (.+)/, (msg, match) => {
      const address = match[1].trim()
      this.fetcher.bitcoinAddress(address)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    this.bot.onText(/^[/|!]btctransaction\S*$/, msg => {
      this.sendMessage(msg.chat.id, 'Error: Provide atleast the Bitcoin transaction hash as argument: /btctransaction <hash>')
    })

    this.bot.onText(/[/|!]btctransaction@?\S* (.+)/, (msg, match) => {
      const hash = match[1].trim()
      // TODO!
      this.fetcher.bitcoinTransaction(hash)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    // transactions command (/btctransactions <address>)
    this.bot.onText(/[/|!]btctransactions@?\S* (.+)/, (msg, match) => {
      const address = match[1].trim()
      // TODO!
      this.fetcher.bitcoinTransactions(address)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => console.error(error))
    })

    this.bot.onText(/^[/|!]btcblock\S*$/, msg => {
      this.sendMessage(msg.chat.id, 'Error: Provide atleast the Bitcoin block hash or block height as argument: /btcblock <hash or block height>')
    })

    // block command (/block <hash or block height>)
    this.bot.onText(/[/|!]block@?\S* (.+)/, (msg, match) => {
      function printBlockInfo (block) {
        const blockTime = Misc.printDate(new Date(block.block_time * 1000))
        const difficulty = parseFloat(block.difficulty).toLocaleString('en', { maximumFractionDigits: 2 })
        const textMsg = `
*Block Height:* ${block.height}
*Hash:* ${block.hash}
*Confirmations:* ${block.confirmations}
*Size:* ${block.block_size} bytes
*Bits:* ${block.bits}
*Nonce:* ${block.nonce}
*Time:* ${blockTime}
*Version:* ${block.version}
*Difficulty:* ${difficulty}
*Chainwork:* ${block.chainwork}
*MerkleRoot:* ${block.merkle_root}
[View Block](${Misc.blockchainExplorerUrl()}/blocks/${block.height})`
        return textMsg
      }
      const hashOrHeight = match[1].trim()
      const chatId = msg.chat.id
      if (Misc.isSha256(hashOrHeight)) {
        // Retrieved block by hash (sha256)
        this.bitcoin.getBlockInfo(hashOrHeight)
          .then(result => {
            if (result.length > 0) {
              this.sendMessage(chatId, printBlockInfo(result[0]))
            } else {
              this.sendMessage(chatId, 'Block not found')
            }
          })
          .catch(error => console.error(error))
      } else {
        // Retrieved block by block height
        this.bitcoin.getBlockHeightInfo(hashOrHeight)
          .then(result => {
            if (result.length > 0) {
              this.sendMessage(chatId, printBlockInfo(result[0]))
            } else {
              this.sendMessage(chatId, 'Block not found')
            }
          })
      }
    })

    // lastblocks command (/btclastblocks)
    // TODO: Implemented getLastBlocks
    this.bot.onText(/[/|!]btclastblocks/, msg => {
      const chatId = msg.chat.id
      /*
      this.bitcoin.getLastBlocks()
        .then(result => {
          let textMsg = '*Last 10 blocks* 🧱'
          for (let i = 0; i < result.length; i++) {
            const block = result[i]
            const blockTime = Misc.printDate(new Date(block.block_time * 1000))
            const difficulty = parseFloat(block.difficulty).toLocaleString('en', { maximumFractionDigits: 3 })
            textMsg += `
    *Height:* ${block.height}
    *Time:* ${blockTime}
    *Size:* ${block.block_size} bytes
    *Difficulty:* ${difficulty}
    [View Block](${BITCOIN_EXPLORER_URL}/blocks/${block.height})
    ------------------------------------------`
          }
          this.sendMessage(chatId, textMsg)
        })
        .catch(error => {
          console.error(error)
        }) */
      this.sendMessage(chatId, 'Not yet implemented')
    })

    // top10 command (/btctop10)
    // TODO: implement getTop10BiggestTransactions
    this.bot.onText(/[/|!]btctop10/, msg => {
      const chatId = msg.chat.id
      /*
      this.bitcoin.getTop10BiggestTransactions()
        .then(result => {
          let textMsg = '*Top 10 biggest transactions of this year* 💰\n'
          for (let i = 0; i < result.length; i++) {
            const amount = parseFloat(result[i].value).toLocaleString('en', { maximumFractionDigits: BTC_PRICE_FRACTION_DIGITS })
            textMsg += `[${amount} BTC](${BITCOIN_EXPLORER_URL}/tx/${result[i].hash}) (in: ${result[i].output_count}, out: ${result[i].output_count}) - ${result[i].created_time}\n`
          }
          this.sendMessage(chatId, textMsg)
        })
        .catch(error => {
          console.error(error)
        }) */
      this.sendMessage(chatId, 'Not yet implemented')
    })

    // Why is Bitcoin created?
    this.bot.onText(/^[/|!]why\S*$/, msg => {
      this.sendMessage(msg.chat.id, `
Bitcoin is P2P electronic cash that is valuable over legacy systems because of the monetary autonomy it brings to its users. 

Bitcoin seeks to address the root problem with conventional currency: all the trust that's required to make it work --
Not that justified trust is a bad thing, but trust makes systems brittle, opaque, and costly to operate. 

Trust failures result in systemic collapses, trust curation creates inequality and monopoly lock-in, 
and naturally arising trust choke-points can be abused to deny access to due process. 
Through the use of cryptographic proof, decentralized networks and open source software Bitcoin minimizes and replaces these trust costs.`)
    })

    // What is Bitcoin?
    this.bot.onText(/^[/|!]what\S*$/, msg => {
      this.sendMessage(msg.chat.id, 'Bitcoin is a peer-to-peer currency. Peer-to-peer means that no central authority issues new money or tracks transactions. These tasks are managed collectively by the network.')
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
    this.bot.onText(/^[/|!]faq\S*$/, msg => {
      this.sendMessage(msg.chat.id, '[Read FAQ](' + FAQ_URL + ')')
    })

    // Other stuff
    this.bot.on('message', msg => {
      if (msg.text) {
        const name = msg.from.first_name
        if (msg.text.toString() === '!' || msg.text.toString() === '/') {
          this.sendMessage(msg.chat.id, 'Please use /help or !help to get more info.')
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
