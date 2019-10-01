const Misc = require('./miscellaneous')

// Constants
const BTC_PRICE_FRACTION_DIGITS = 5
const DOLLAR_PRICE_FRACTION_DIGITS = 8
const FAQ_URL = 'https://bitcoin.org/en/faq'
const OPEN_URL = 'https://open.bitcoin.com'
const COINMARKET_URL = 'https://coinmarketcap.com/currencies/bitcoin'
const EXPLORER_URL = 'https://www.blockchain.com/btc'

class Telegram {
  constructor (bot, bitcoin, exchange) {
    this.bot = bot
    this.bitcoin = bitcoin
    this.exchange = exchange
  }

  /**
   * Telegram commands
   */
  setCommands () {
    // help command - show available commands
    this.bot.onText(/[/|!]help/, msg => {
      const chatId = msg.chat.id
      const helpText = `
/help - Return this help output
/status - Retrieve Lbrynet, Lbrycrd, Chainquery status
/networkinfo - Get Bitcoin Network info
/stats - Get blockchain, mining and exchange stats
/price - Get market (price) info

/lastblocks - Get the last 10 blocks
/transaction <hash> - Get transaction info
/address <address> - Get address info
/transactions <address> - Get last 10 transactions from an address
/block <hash or block height> - Get block info

/why - Why Bitcoin?
/what - What is Bitcoin?
/how - How does Bitcoin work?
/age - How long does Bitcoin exists?
/faq - Frequality Asked Questions`
      this.bot.sendMessage(chatId, helpText)
    })

    // Give FAQ Link
    this.bot.onText(/^[/|!]faq\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, '[Read FAQ](' + FAQ_URL + ')', { parse_mode: 'markdown' })
    })

    // Why is Bitcoin created?
    this.bot.onText(/^[/|!]why\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, `
Bitcoin is P2P electronic cash that is valuable over legacy systems because of the monetary autonomy it brings to its users. 

Bitcoin seeks to address the root problem with conventional currency: all the trust that's required to make it work --
Not that justified trust is a bad thing, but trust makes systems brittle, opaque, and costly to operate. 

Trust failures result in systemic collapses, trust curation creates inequality and monopoly lock-in, 
and naturally arising trust choke-points can be abused to deny access to due process. 
Through the use of cryptographic proof, decentralized networks and open source software Bitcoin minimizes and replaces these trust costs.`)
    })

    // What is Bitcoin?
    this.bot.onText(/^[/|!]what\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, 'Bitcoin is a peer-to-peer currency. Peer-to-peer means that no central authority issues new money or tracks transactions. These tasks are managed collectively by the network.')
    })

    // How does Bitcoin work?
    this.bot.onText(/^[/|!]how\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, `
Bitcoin uses public-key cryptography, peer-to-peer networking, and proof-of-work to process and verify payments.

Bitcoins are sent (or signed over) from one address to another with each user potentially having many, many addresses. 
Each payment transaction is broadcast to the network and included in the blockchain so that the included bitcoins cannot be spent twice. 
After an hour or two, each transaction is locked in time by the massive amount of processing power that continues to extend the blockchain.

Using these techniques, Bitcoin provides a fast and extremely reliable payment network that anyone can use.`)
    })

    // Age, since when does Bitcoin exists (first genesis block)
    // Source: https://www.blockchain.com/btc/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
    this.bot.onText(/^[/|!]age\S*$/, msg => {
      const chatId = msg.chat.id
      const age = Misc.timestampToDate(Date.now() - 1231002905000) // timestamp ms since creation on the genesis block
      this.bot.sendMessage(chatId, `Bitcoin age: ${age.year} years, ${age.month} months, ${age.day} days, ${age.hour}h ${age.minute}m ${age.second}s, since the first mined block.`)
    })

    // status command (detailed status report)
    this.bot.onText(/[/|!]status/, msg => {
      const bitcoin = this.bitcoin
      const bot = this.bot
      const chatId = msg.chat.id
      let text = ''
      bitcoin.getLbryNetStatus()
        .then(result => {
          text += `*General* 🖥
Lbrynet daemon running: ${result.is_running}
Lbrynet connection: ${result.connection_status.code}`
        })
        .catch(error => {
          console.error(error)
          text += 'Error: Could not Bitcoinnet (SDK) info!\n'
        })
        .then(function () {
          // always executed
          bitcoin.getNetworkInfo()
            .then(networkResult => {
              text += `
Lbrycrd version: ${networkResult.subversion}
Protocol version: ${networkResult.protocolversion}
\n*Peer info*
Peers connected: ${networkResult.connections}`
            })
            .catch(error => {
              console.error(error)
              text += 'Error: Could not fetch network info!\n'
            })
            .then(function () {
              // always executed
              bitcoin.getPeerInfo()
                .then(peerResult => {
                  text += '\nFirst peer details:'
                  if (peerResult.length > 0) {
                    const sendTime = Misc.printDate(new Date(peerResult[0].lastsend * 1000))
                    const recieveTime = Misc.printDate(new Date(peerResult[0].lastrecv * 1000))
                    const ping = parseFloat(peerResult[0].pingtime * 1000).toFixed(2)
                    text += `
    Ping: ${ping} ms
    Last send: ${sendTime}
    Last receive: ${recieveTime}`
                  } else {
                    text += 'Warning: No peers connected...'
                  }
                })
                .catch(error => {
                  console.error(error)
                  text += 'Error: Could not fetch peer info!\n'
                })
                .then(function () {
                  // always executed
                  bitcoin.getWalletInfo()
                    .then(walletResult => {
                      const oldestKeyTime = Misc.printDate(new Date(walletResult.keypoololdest * 1000))
                      text += `
\n*Wallet info* 👛
Oldest address in keypool: ${oldestKeyTime}
# of reserved addresses: ${walletResult.keypoolsize}`
                    })
                    .catch(error => {
                      console.error(error)
                      text += 'Error: Could not fetch wallet info!\n'
                    })
                    .then(function () {
                      // always executed, finally we send the info back!
                      bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
                    })
                })
            })
        })
    })

    this.bot.onText(/^[/|!]file\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, 'Error: Provide atleast the URI as argument: /file <uri>')
    })

    this.bot.onText(/[/|!]networkinfo/, msg => {
      const chatId = msg.chat.id
      this.bitcoin.getNetworkInfo()
        .then(result => {
          var text = `
*Network* ℹ️
Bitcoin server version: ${result.version}
Protocol version: ${result.protocolversion}
Connections: ${result.connections}
P2P active: ${result.networkactive}
Minimum relay fee:  ${result.relayfee} BTC/kB
Minimum incremental fee: ${result.incrementalfee} BTC/kB
Networks:`
          const networks = result.networks
          for (let i = 0; i < networks.length; i++) {
            text += `
    Name: ${networks[i].name}
    Only net: ${networks[i].limited}
    Reachable: ${networks[i].reachable}
    -----------------------`
          }
          this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
        })
        .catch(error => {
          console.error(error)
          this.bot.sendMessage(chatId, 'Could not fetch network info, still verifying blocks... Or can\'t connect to core deamon API.')
        })
    })

    this.bot.onText(/[/|!]stats/, msg => {
      const chatId = msg.chat.id
      this.bitcoin.getBlockChainInfo()
        .then(result => {
          this.bitcoin.getMiningInfo()
            .then(miningResult => {
              const hashrateth = (parseFloat(miningResult.networkhashps) / 1000.0 / 1000.0 / 1000.0 / 1000.0).toFixed(2)
              this.exchange.getExchangeInfo()
                .then(exchangeResult => {
                  const medianTime = Misc.printDate(new Date(result.mediantime * 1000))
                  const marketCap = exchangeResult.market_cap.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  const difficulty = parseFloat(result.difficulty).toLocaleString('en', { maximumFractionDigits: 3 })
                  const difficulty24h = parseFloat(exchangeResult.difficulty24).toLocaleString('en', { maximumFractionDigits: 3 })
                  const difficulty3d = parseFloat(exchangeResult.difficulty3).toLocaleString('en', { maximumFractionDigits: 3 })
                  const difficulty7d = parseFloat(exchangeResult.difficulty7).toLocaleString('en', { maximumFractionDigits: 3 })
                  const blockTimeMin = Math.floor(parseFloat(exchangeResult.block_time) / 60)
                  const blockTimeSec = (((parseFloat(exchangeResult.block_time) / 60) % 2) * 60).toFixed(0)
                  const exchangeRate = parseFloat(exchangeResult.exchange_rate).toFixed(10)
                  const exchangeRate24h = parseFloat(exchangeResult.exchange_rate24).toFixed(10)
                  const exchangeRate3d = parseFloat(exchangeResult.exchange_rate3).toFixed(10)
                  const exchangeRate7d = parseFloat(exchangeResult.exchange_rate7).toFixed(10)
                  const text = `*General* 🖥
Last block: ${medianTime}
Median time current best block: ${result.mediantime}
Hash best block: ${result.bestblockhash}
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
Block reward 24 hours avg: ${exchangeResult.block_reward24} BTC
Block reward 3 days avg: ${exchangeResult.block_reward3} BTC

*Exchange* 💱
Exchange rate: ${exchangeRate} BTC-LTC
Exchange rate 24 hours avg: ${exchangeRate24h} BTC-LTC
Exchange rate 3 days avg: ${exchangeRate3d} BTC-LTC
Exchange rate 7 days avg: ${exchangeRate7d} BTC-LTC`
                  this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
                })
                .catch(error => {
                  console.error(error)
                })
            })
            .catch(error => {
              console.error(error)
            })
        })
        .catch(error => {
          console.error(error)
        })
    })

    // price command (/price)
    this.bot.onText(/[/|!]price@?\S*/, msg => {
      this.exchange.getLatestPrices()
        .then(result => {
          this.exchange.getExchangeInfo()
            .then(exchangeResult => {
              const chatId = msg.chat.id
              const bitcoinPrice = parseFloat(exchangeResult.exchange_rate).toFixed(10)
              const bitcoinPriceDateTime = Misc.printDate(new Date(exchangeResult.timestamp * 1000))
              const quote = result.quote.USD
              const maxSupply = result.max_supply.toLocaleString('en')
              const totalSupply = result.total_supply.toLocaleString('en')
              const circulating = result.circulating_supply.toLocaleString('en', { maximumFractionDigits: 0 })
              const dollarPrice = quote.price.toLocaleString('en', { maximumFractionDigits: DOLLAR_PRICE_FRACTION_DIGITS })
              const dollarPriceLastUpdated = quote.last_updated
              const volume24h = parseFloat(quote.volume_24h).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              const volume7d = parseFloat(quote.volume_7d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              const volume30d = parseFloat(quote.volume_30d).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              const marketCap = parseFloat(quote.market_cap).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              const hourChangeIcon = (Math.sign(quote.percent_change_1h) === 1) ? '👍' : '👎'
              const hour24ChangeIcon = (Math.sign(quote.percent_change_24h) === 1) ? '👍' : '👎'
              const days7ChangeIcon = (Math.sign(quote.percent_change_7d) === 1) ? '👍' : '👎'
              const text = `*General* 📈
Rank on CoinMarketCap: [#${result.cmc_rank}](${COINMARKET_URL})
Max. available coins: ${maxSupply} BTCs
Current amount coins: ${totalSupply} BTCs
Number of coins circulating: ${circulating} BTCs

*Price* 💸
Price: $${dollarPrice}/BTC
Last updated dollar: ${dollarPriceLastUpdated}
Price: 1 BTC = ${bitcoinPrice} BTC 
Last updated BTC: ${bitcoinPriceDateTime}
Volume 24 hour avg: $${volume24h}
Volume 7 days avg: $${volume7d}
Volume 30 days avg: $${volume30d}
Market capital: $${marketCap}

*% Change*
Last hour: ${quote.percent_change_1h}% ${hourChangeIcon}
Last 24 hours: ${quote.percent_change_24h}% ${hour24ChangeIcon}
Last 7 days: ${quote.percent_change_7d}% ${days7ChangeIcon}`
              this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
            })
            .catch(error => {
              console.error(error)
            })
        })
        .catch(error => {
          console.error(error)
        })
    })

    // address command (/address <address>)
    this.bot.onText(/[/|!]address@?\S* (.+)/, (msg, match) => {
      const address = match[1].trim()
      this.bitcoin.getAddressInfo(address)
        .then(result => {
          const chatId = msg.chat.id
          if (result.length > 0) {
            const currentAddress = result[0]
            const balance = parseFloat(currentAddress.balance).toLocaleString('en', { maximumFractionDigits: BTC_PRICE_FRACTION_DIGITS })
            const text = `
*Created at:* ${currentAddress.created_at}
*Modified at:* ${currentAddress.modified_at}
*Balance:* ${balance} BTC
[View online](${EXPLORER_URL}/address/${address})`
            this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
          } else {
            this.bot.sendMessage(chatId, 'Address is not (yet) used.')
          }
        })
        .catch(error => {
          console.error(error)
        })
    })

    this.bot.onText(/^[/|!]transaction\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, 'Error: Provide atleast the transaction hash as argument: /transaction <hash>')
    })

    this.bot.onText(/[/|!]transaction@?\S* (.+)/, (msg, match) => {
      const hash = match[1].trim()
      const chatId = msg.chat.id
      this.bitcoin.getTransaction(hash)
        .then(result => {
          const currentTransaction = result[0]
          let text = `
*Amount:* ${currentTransaction.value} BTC (input count: ${currentTransaction.input_count}, output count:${currentTransaction.output_count})
*🧱 Height:* ${currentTransaction.height}
*Created at:* ${currentTransaction.created_at}
*Size:* ${currentTransaction.transaction_size} bytes
[View transaction online](${EXPLORER_URL}/tx/${hash})`
          if (currentTransaction.title) {
            text += `\n
*Claim Title:* ${currentTransaction.title}
[View connected claim](${OPEN_URL}/${currentTransaction.name})`
          }
          this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
          // Why not, just send the thumbnail as well!
          if (currentTransaction.thumbnail_url) { this.bot.sendPhoto(chatId, currentTransaction.thumbnail_url, { caption: 'Thumbnail: ' + currentTransaction.title }) }
        })
        .catch(error => {
          console.error(error)
        })
    })

    // transactions command (/transactions <address>)
    this.bot.onText(/[/|!]transactions@?\S* (.+)/, (msg, match) => {
      const address = match[1].trim()
      const chatId = msg.chat.id
      this.bitcoin.getAddressInfo(address)
        .then(result => {
          if (result.length > 0) {
            this.bitcoin.getTransactions(result[0].id)
              .then(list => {
                let text = '*Last 10 transactions*'
                if (list.length > 0) {
                  for (let i = 0; i < list.length; i++) {
                    let amount = ''
                    if (list[i].credit_amount !== '0.00000000') {
                      amount = parseFloat(list[i].credit_amount).toLocaleString('en', { maximumFractionDigits: BTC_PRICE_FRACTION_DIGITS })
                    } else {
                      amount = '-' + parseFloat(list[i].debit_amount).toLocaleString('en', { maximumFractionDigits: BTC_PRICE_FRACTION_DIGITS })
                    }
                    text += `
    Hash: ${list[i].hash}
    Amount: ${amount} BTC
    Timestamp: ${list[i].created_time}
    [View transaction](${EXPLORER_URL}/tx/${list[i].hash}?address=${address}#${address})
    -----------------------------`
                  }
                  this.bot.sendMessage(chatId, text, { parse_mode: 'markdown' })
                } else {
                  this.bot.sendMessage(chatId, 'No transactions found (yet)')
                }
              })
              .catch(error => {
                console.error(error)
              })
          } else {
            this.bot.sendMessage(chatId, 'Address not found')
          }
        })
        .catch(error => {
          console.error(error)
        })
    })

    this.bot.onText(/^[/|!]block\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, 'Error: Provide atleast the block hash or block height as argument: /block <hash or block height>')
    })

    // block command (/block <hash or block height>)
    this.bot.onText(/[/|!]block@?\S* (.+)/, (msg, match) => {
      function printBlockInfo (block) {
        const blockTime = Misc.printDate(new Date(block.block_time * 1000))
        const difficulty = parseFloat(block.difficulty).toLocaleString('en', { maximumFractionDigits: 2 })
        const textMsg = `
*🧱 Height:* ${block.height}
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
[View Block](${EXPLORER_URL}/blocks/${block.height})`
        return textMsg
      }
      const hashOrHeight = match[1].trim()
      const chatId = msg.chat.id
      if (Misc.isSha256(hashOrHeight)) {
        // Retrieved block by hash (sha256)
        this.bitcoin.getBlockInfo(hashOrHeight)
          .then(result => {
            if (result.length > 0) {
              this.bot.sendMessage(chatId, printBlockInfo(result[0]), { parse_mode: 'markdown' })
            } else {
              this.bot.sendMessage(chatId, 'Block not found')
            }
          })
          .catch(error => {
            console.error(error)
          })
      } else {
        // Retrieved block by block height
        this.bitcoin.getBlockHeightInfo(hashOrHeight)
          .then(result => {
            if (result.length > 0) {
              this.bot.sendMessage(chatId, printBlockInfo(result[0]), { parse_mode: 'markdown' })
            } else {
              this.bot.sendMessage(chatId, 'Block not found')
            }
          })
      }
    })

    // lastcontent command
    this.bot.onText(/[/|!]lastcontent/, msg => {
      const chatId = msg.chat.id
      this.bitcoin.getLastContentClaims()
        .then(result => {
          let textMsg = '*Last 10 uploaded content*\n'
          for (let i = 0; i < result.length; i++) {
            const content = result[i]
            const type = content.content_type.split('/')[0]
            textMsg += `${content.created_at} - [${content.title}](${OPEN_URL}/${content.name}) (${type})\n`
          }
          this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
        })
        .catch(error => {
          console.error(error)
        })
    })

    // lastchannels command
    this.bot.onText(/[/|!]lastchannels/, msg => {
      const chatId = msg.chat.id
      this.bitcoin.getLastChannelsClaims()
        .then(result => {
          let textMsg = '*Last 10 new channels*\n'
          for (let i = 0; i < result.length; i++) {
            const channel = result[i]
            textMsg += `${channel.created_at} - [${channel.name}](${OPEN_URL}/${channel.name})\n`
          }
          this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
        })
        .catch(error => {
          console.error(error)
        })
    })

    // lastblocks command (/lastblocks)
    this.bot.onText(/[/|!]lastblocks/, msg => {
      const chatId = msg.chat.id
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
    [View Block](${EXPLORER_URL}/blocks/${block.height})
    ------------------------------------------`
          }
          this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
        })
        .catch(error => {
          console.error(error)
        })
    })

    // top10 command (/top10)
    this.bot.onText(/[/|!]top10/, msg => {
      const chatId = msg.chat.id
      this.bitcoin.getTop10BiggestTransactions()
        .then(result => {
          let textMsg = '*Top 10 biggest transactions of this year* 💰\n'
          for (let i = 0; i < result.length; i++) {
            const amount = parseFloat(result[i].value).toLocaleString('en', { maximumFractionDigits: BTC_PRICE_FRACTION_DIGITS })
            textMsg += `[${amount} BTC](${EXPLORER_URL}/tx/${result[i].hash}) (in: ${result[i].output_count}, out: ${result[i].output_count}) - ${result[i].created_time}\n`
          }
          this.bitcoin.getTop100Channels()
            .then(channelResult => {
              // Retrieve the top 10 only
              if (channelResult.vanity_names && channelResult.vanity_names.length >= 5) {
                textMsg += '\n*Top 10 most subscribed channels*\n'
                let medalIcon = null
                for (let i = 0; i < 10; i++) {
                  if (i === 0) {
                    medalIcon = '🥇'
                  } else if (i === 1) {
                    medalIcon = '🥈'
                  } else if (i === 2) {
                    medalIcon = '🥉'
                  } else {
                    medalIcon = ''
                  }
                  textMsg += `${medalIcon} [${channelResult.vanity_names[i]}](${OPEN_URL}/${channelResult.vanity_names[i]}) (${channelResult.subscribers[i]} subscribers)\n`
                }
              }
              this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
            })
            .catch(error => {
              console.error(error)
            })
        })
        .catch(error => {
          console.error(error)
        })
    })

    this.bot.onText(/^[/|!]tips\S*$/, msg => {
      const chatId = msg.chat.id
      this.bot.sendMessage(chatId, 'Error: Provide atleast the name (like @channelname) as argument: /tips <name>')
    })

    // tips command
    this.bot.onText(/[/|!]tips@?\S* (.+)/, (msg, match) => {
      const name = match[1].trim()
      const chatId = msg.chat.id
      this.bitcoin.resolve(name)
        .then(resolve => {
          if (name in resolve) {
            const channelOrContent = resolve[name]
            this.bitcoin.getTop10Tips(channelOrContent.claim_id)
              .then(tipsResult => {
                if (tipsResult.length > 0) {
                  let textMsg = '*Effective amount:* ' + channelOrContent.meta.effective_amount + ' BTC\n'
                  textMsg += '*Top 10 highest tips*\n'
                  for (let i = 0; i < tipsResult.length; i++) {
                    const amount = parseFloat(tipsResult[i].amount).toLocaleString('en', { maximumFractionDigits: BTC_PRICE_FRACTION_DIGITS })
                    textMsg += `[${amount} BTC](${EXPLORER_URL}/tx/${tipsResult[i].hash}) - ${tipsResult[i].created_at} - ${tipsResult[i].name}\n`
                  }
                  this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
                } else if ('error' in channelOrContent) {
                  this.bot.sendMessage(chatId, 'Could not resolve the request 😢 (be-sure you start the channel name with @-sign)')
                } else {
                  this.bot.sendMessage(chatId, 'No tips received yet 😢')
                }
              })
              .catch(error => {
                console.error(error)
              })
          } else {
            this.bot.sendMessage(chatId, 'Something went wrong with resolving 😢')
          }
        })
        .catch(error => {
          console.error(error)
        })
    })
    // TODO: Last channel tips?

    // contenttips command
    this.bot.onText(/[/|!]contenttips@?\S* (.+)/, (msg, match) => {
      const contentName = match[1].trim()
      const chatId = msg.chat.id
      this.bitcoin.resolve(contentName)
        .then(resolve => {
          if (contentName in resolve) {
            const content = resolve[contentName]
            this.bitcoin.getTopContentTips(content.claim_id)
              .then(tipsResult => {
                if (tipsResult.length > 0) {
                  this.bitcoin.getChannelNameString(tipsResult[0].publisher_id)
                    .then(channelResult => {
                      const channelName = channelResult[0].name
                      let textMsg = `*Top 10 highest content tips* (channel: [${channelName}](${OPEN_URL}/${channelName}))\n`
                      for (let i = 0; i < tipsResult.length; i++) {
                        const amount = parseFloat(tipsResult[i].amount).toLocaleString('en', { maximumFractionDigits: BTC_PRICE_FRACTION_DIGITS })
                        textMsg += `[${amount} BTC](${EXPLORER_URL}/tx/${tipsResult[i].hash}) - ${tipsResult[i].created_at} \n`
                      }
                      textMsg += `[View content](${OPEN_URL}/${content.permanent_url.replace(/(^\w+:|^)\/\//, '')})`
                      this.bot.sendMessage(chatId, textMsg, { parse_mode: 'markdown' })
                    })
                    .catch(error => {
                      console.error(error)
                    })
                } else {
                  this.bot.sendMessage(chatId, 'No tips received yet 😢')
                }
              })
              .catch(error => {
                console.error(error)
              })
          } else {
            this.bot.sendMessage(chatId, 'Something went wrong with resolving 😢')
          }
        })
        .catch(error => {
          console.error(error)
        })
    })

    // Other stuff
    this.bot.on('message', msg => {
      if (msg.text) {
        const name = msg.from.first_name
        if (msg.text.toString() === '!' || msg.text.toString() === '/') {
          this.bot.sendMessage(msg.chat.id, 'Please use /help or !help to get more info.')
        } else if (msg.text.toString().toLowerCase().startsWith('hello') || msg.text.toString().toLowerCase().startsWith('hi')) {
          this.bot.sendMessage(msg.chat.id, 'Welcome ' + name + ' 🤟!')
        } else if (msg.text.toString().toLowerCase().startsWith('bye')) {
          this.bot.sendMessage(msg.chat.id, 'Hope to see you around again, 👋 *Bye ' + name + '* 👋!', { parse_mode: 'markdown' })
        }
      }
    })
  }
}

module.exports = Telegram
