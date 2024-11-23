import Misc from './miscellaneous.js'
import logger from './logger.js'
import { globalState } from './globalState.js'

export default class Telegram {
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
   * Send message to Telegram chat
   * @param {Number} chatId Telegram chat ID
   * @param {String} message Message string
   * @param {Object} options Telegram chat options (optional)
   */
  sendMessage (chatId, message, options = { parse_mode: 'MarkdownV2', disable_web_page_preview: true }) {
    this.bot.sendMessage(chatId, message, options).catch((error) => {
      logger.warn(`WARN: Message attempted to send (to chatID: ${chatId}): ${message}`)
      logger.error('Error: Could not send message due to: ' + error.message)
      globalState.errorState = true
    })
  }

  /**
   * Send image to Telegram chat
   * @param {Number} chartId Telegram chat ID
   * @param {Stream} image Stream/buffer image
   */
  sendImage (chartId, image) {
    this.bot.sendPhoto(chartId, image).catch((error) => {
      logger.error(error)
      globalState.errorState = true
    })
  }

  /**
   * Telegram commands
   */
  setCommands () {
    // help command - show available commands
    this.bot.onText(/^[/|!]help/, (msg) => {
      const text = `
General:
  /help \\- Show help output
  /price \\<symbol\\> \\[\\<quote\\-symbol\\>\\] \\- Get latest crypto price \\(default BCH\\)
  /detailedprice \\<symbol\\> \\- Get latest detailed price overview \\(default BCH\\)
  /dominance \\<symbol\\> \\- Get crypto dominance \\(default BCH\\)
  /stats \\<symbol\\> \\- Get latest market statistics \\(default BCH\\)
  /overview \\[\\<limit\\>\\] \\- General crypto market overview, limit is optional
  /detailedoverview \\[\\<limit\\>\\] \\- Detailed crypto market overview, limit is optional
  /chart \\<symbol\\> \\- Retrieve a chart from Tradingview \\(default BCH\\)
  /faq \\- Frequently Asked Questions

Bitcoin Cash:
  /balance \\<address\\> \\- Get wallet balance from a BCH address
  /transaction \\<hash\\> \\- Get transaction details from a BCH transaction
  /block \\<hash\\> \\- Get block details from the BCH blockchain
  /latestblocks \\- Get the 8 latest blocks on BCH network
  /latesttransactions \\- Get the 8 latest transactions on BCH network
  /latesttx \\- Get the 8 latest transactions on BCH network
  /info \\- Get blockchain, mining and exchange stats from the BCH network
  /nodestatus \\- Retrieve Bitcoin Cash Node info
  /network \\- Get Bitcoin Cash Network info
  /fee \\- Get estimated fee for BCH
  /transactions \\<address\\> \\- Get latest 10 BCH transactions from an address \\(TODO\\)

More info:
  /why \\- Why Bitcoin?
  /what \\- What is Bitcoin?
  /how \\- How does Bitcoin work?
  /age \\- How long does Bitcoin exists?`
      this.sendMessage(msg.chat.id, text)
    })

    // price command (/price): default Bitcoin Cash
    this.bot.onText(/^[/|!]price\S*$/, (msg) => {
      // Fall-back to Bitcoin Cash (symbol: BCH)
      this.fetcher.priceQuotes('BCH')
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // price command (/price <symbol> [<quote_symbol>]) - provide your own base symbol, and optionally a second parameter as the quote symbol
    this.bot.onText(/^[/|!]price@?\S* (\w+) ?(\w+)?/, (msg, match) => {
      const symbol = match[1].trim()
      let quoteSymbol = null
      if (typeof match[2] !== 'undefined') {
        quoteSymbol = match[2].trim()
      }
      this.fetcher.priceQuotes(symbol, quoteSymbol)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // detailedprice command (/detailedprice): default Bitcoin Cash
    this.bot.onText(/^[/|!]detailedprice\S*$/, (msg) => {
      // Fall-back to Bitcoin Cash (symbol: BCH)
      this.fetcher.detailedPriceQuotes('BCH')
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // detailedprice command (/detailedprice <symbol>) - provide your own base symbol
    this.bot.onText(/^[/|!]detailedprice@?\S* (\w+)/, (msg, match) => {
      const symbol = match[1].trim()
      this.fetcher.detailedPriceQuotes(symbol)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // dominance command (/dominance): default Bitcoin Cash
    this.bot.onText(/^[/|!]dominance\S*$/, (msg) => {
      this.fetcher.dominance('BCH')
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // dominance command (/dominance <symbol>) - provide your own base symbol
    this.bot.onText(/^[/|!]dominance@?\S* (\w+)/, (msg, match) => {
      const symbol = match[1].trim()
      this.fetcher.dominance(symbol)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // stats command (/stats): default Bitcoin Cash
    this.bot.onText(/^[/|!]stats\S*$/, (msg) => {
      // Fall-back to Bitcoin Cash (symbol: BCH)
      this.fetcher.marketStats('BCH')
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // stats command (/stats <symbol>) - provide your own symbol
    this.bot.onText(/^[/|!]stats@?\S* (\w+)/, (msg, match) => {
      const symbol = match[1].trim()
      this.fetcher.marketStats(symbol)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // Market overview command (/overview)
    this.bot.onText(/^[/|!]overview\S*$/, (msg) => {
      this.fetcher.marketOverview()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // Market overview command (/overview) - in-/decrease limit to coins
    this.bot.onText(/^[/|!]overview@?\S* (\d+)/, (msg, match) => {
      const limit = parseInt(match[1].trim())
      if (isNaN(limit)) {
        this.sendMessage(msg.chat.id, 'Error: Provide a number as argument\\.')
      } else {
        if (limit <= 0) {
          this.sendMessage(msg.chat.id, 'Error: A number above the 0 will help\\. Try again\\.')
        } else if (limit > 50) {
          this.sendMessage(msg.chat.id, 'Error: Let\'s keep the overview limited to 50 results\\. Try again\\.')
        } else {
          this.fetcher.marketOverview(limit)
            .then(message => this.sendMessage(msg.chat.id, message))
            .catch(error => logger.error(error))
        }
      }
    })

    // Detailed market overview command (/detailedoverview)
    this.bot.onText(/^[/|!]detailedoverview\S*$/, (msg) => {
      this.fetcher.detailedMarketOverview()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // Detailed market overview command (/detailedoverview) - in-/decrease limit to coins
    this.bot.onText(/^[/|!]detailedoverview@?\S* (\d+)/, (msg, match) => {
      const limit = parseInt(match[1].trim())
      if (isNaN(limit)) {
        this.sendMessage(msg.chat.id, 'Error: Provide a number as argument\\.')
      } else {
        if (limit <= 0) {
          this.sendMessage(msg.chat.id, 'Error: A number above the 0 will help\\. Try again\\.')
        } else if (limit > 50) {
          this.sendMessage(msg.chat.id, 'Error: Let\'s keep the overview limited to 50 results\\. Try again\\.')
        } else {
          this.fetcher.detailedMarketOverview(limit)
            .then(message => this.sendMessage(msg.chat.id, message))
            .catch(error => logger.error(error))
        }
      }
    })

    // chart command (/chart): default Bitcoin Cash
    this.bot.onText(/^[/|!]chart\S*$/, (msg) => {
      // Fall-back to Bitcoin Cash (symbol: BCH)
      this.fetcher.chartImage('BCH')
        .then(image => this.sendImage(msg.chat.id, image))
        .catch(error => logger.error(error))
    })

    // chart command (/chart <symbol> [<quote_symbol>]) - provide your own base symbol, and optionally a second parameter as the quote symbol
    this.bot.onText(/^[/|!]chart@?\S* (\w+) ?(\w+)?/, (msg, match) => {
      const symbol = match[1].trim()
      let quoteSymbol = 'USD' // Default
      if (typeof match[2] !== 'undefined') {
        quoteSymbol = match[2].trim()
      }
      this.fetcher.chartImage(symbol, quoteSymbol)
        .then(image => this.sendImage(msg.chat.id, image))
        .catch(error => logger.error(error))
    })

    // Bitcoin cash node status command (/nodestatus)
    this.bot.onText(/^[/|!]nodestatus/, (msg) => {
      this.fetcher.bitcoinStatus()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // Bitcoin network command (/network)
    this.bot.onText(/^[/|!]network/, (msg) => {
      this.fetcher.bitcoinNetworkInfo()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => {
          logger.error(error)
          this.sendMessage(msg.chat.id, 'Error: Could not fetch network info, still verifying blocks\\.\\.\\. Or can\'t connect to the Bitcoin Cash Node \\(BCHN\\) API\\.')
        })
    })

    // Bitcoin Cash information command (/info)
    this.bot.onText(/^[/|!]info/, (msg) => {
      this.fetcher.bitcoinInfo()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // Bitcoin Cash estimated fee command (/fee)
    this.bot.onText(/^[/|!]fee/, (msg) => {
      this.fetcher.bitcoinEstimateFee()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    this.bot.onText(/^[/|!]balance\S*$/, (msg) => {
      this.sendMessage(msg.chat.id, 'Error: Provide at least the Bitcoin Cash address as argument: /balance \\<bitcoincash:address\\>')
    })

    // address command (/balance <address>)
    this.bot.onText(/^[/|!]balance@?\S* (.+)/, (msg, match) => {
      const address = match[1].trim()
      this.fetcher.bitcoinAddressBalance(address)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    this.bot.onText(/^[/|!]transaction\S*$/, (msg) => {
      this.sendMessage(msg.chat.id, 'Error: Provide at least the Bitcoin Cash transaction hash as argument: /transaction \\<hash\\>')
    })

    // transaction details (/transaction <hash>)
    this.bot.onText(/^[/|!]transaction@?\S* (\w+)/, (msg, match) => {
      const hash = match[1].trim()
      // TODO: Improve details like fee & total transaction amounts
      this.fetcher.bitcoinTransaction(hash)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // transactions command (/transactions <address>)
    this.bot.onText(/^[/|!]transactions@?\S* (\w+)/, (msg, match) => {
      const address = match[1].trim()
      // TODO: Fully missing
      this.fetcher.bitcoinTransactions(address)
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    this.bot.onText(/^[/|!]block\S*$/, (msg) => {
      this.sendMessage(msg.chat.id, 'Error: Provide at least the Bitcoin Cash block hash as argument: /block \\<hash\\>')
    })

    // Bitcoin Cash block command (/block <hash>)
    this.bot.onText(/^[/|!]block@?\S* (\w+)/, (msg, match) => {
      const hash = match[1].trim()
      if (Misc.isSha256(hash)) {
        // Retrieved block by hash (sha256)
        this.fetcher.bitcoinBlock(hash)
          .then(message => this.sendMessage(msg.chat.id, message))
          .catch(error => logger.error(error))
      } else {
        // TODO: Retrieve by block hash
        this.sendMessage(msg.chat.id, 'Info: Please provide a block hash, other parameters are not yet supported\\.')
      }
    })

    // latestblocks command (/latestblocks), returns latest 8 blocks
    this.bot.onText(/^[/|!]latestblocks/, (msg) => {
      this.fetcher.bitcoinLatestBlocks()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // latesttransactions command (/latesttransactions or /latesttx), returns latest 8 TXs
    this.bot.onText(/^[/|!](latesttransactions|latesttx)/, (msg) => {
      this.fetcher.bitcoinLatestTransactions()
        .then(message => this.sendMessage(msg.chat.id, message))
        .catch(error => logger.error(error))
    })

    // top10 command (/top10)
    // TODO: implement getTop10BiggestTransactions
    this.bot.onText(/^[/|!]top10/, (msg) => {
      this.sendMessage(msg.chat.id, 'Not yet implemented')
    })

    // Why is Bitcoin created?
    this.bot.onText(/^[/|!]why\S*$/, (msg) => {
      this.sendMessage(msg.chat.id, `
Bitcoin Cash is P2P electronic cash that is valuable over legacy systems because of the monetary autonomy it brings to its users\\. 

Bitcoin seeks to address the root problem with conventional currency: all the trust that's required to make it work \\-\\-
Not that justified trust is a bad thing, but trust makes systems brittle, opaque, and costly to operate\\. 

Trust failures result in systemic collapses, trust curation creates inequality and monopoly lock\\-in, 
and naturally arising trust choke\\-points can be abused to deny access to due process\\. 
Through the use of cryptographic proof, decentralized networks and open\\-source software Bitcoin Cash minimizes and replaces these trust costs\\.

[Read more about why Bitcoin Cash](https://bitcoincash.org/#why)`)
    })

    // What is Bitcoin?
    this.bot.onText(/^[/|!]what\S*$/, (msg) => {
      this.sendMessage(msg.chat.id, 'Bitcoin Cash \\(BCH\\) is a peer\\-to\\-peer currency\\. Peer\\-to\\-peer means that no central authority issues new money or tracks transactions\\. These tasks are managed collectively by the network\\.')
    })

    // How does Bitcoin work?
    this.bot.onText(/^[/|!]how\S*$/, (msg) => {
      this.sendMessage(msg.chat.id, `
Bitcoin uses public\\-key cryptography, peer\\-to\\-peer networking, and proof\\-of\\-work to process and verify payments\\.

Bitcoins are sent \\(or signed over\\) from one address to another with each user potentially having many, many addresses\\. 
Each payment transaction is broadcast to the network and included in the blockchain so that the included bitcoins cannot be spent twice\\. 
After an hour or two, each transaction is locked in time by the massive amount of processing power that continues to extend the blockchain\\.

Using these techniques, Bitcoin provides a fast and extremely reliable payment network that anyone can use\\.`)
    })

    this.bot.onText(/^[/|!]age\S*$/, (msg) => {
      const message = this.fetcher.bitcoinAge()
      this.sendMessage(msg.chat.id, message)
    })

    // Give FAQ Link
    this.bot.onText(/^[/|!]faq\S*$/, (msg) => {
      this.sendMessage(msg.chat.id, '[Read FAQ](https://bitcoincashpodcast.com/faqs)')
    })

    // Other stuff
    this.bot.on('message', (msg) => {
      const catResponses = [
        'Did you know? Cats can jump up to six times their length in one leap\\. Meow\\-gical, right?',
        'Why was the cat sitting on the computer? Because it wanted to keep an eye on the mouse\\!',
        "Here's a fun cat fact: In ancient times cats were worshipped as gods; they have not forgotten this\\. \\- Terry Pratchett",
        'Time spent with cats is never wasted\\. \\- Sigmund Freud',
        "Here's a kitty to make you smile\\! 🐱"
      ]
      const dogResponses = [
        'Why did the dog sit in the shade? Because he didn\'t want to be a hot dog\\!',
        'What do you call a dog magician? A labracadabrador\\!',
        "Ever wonder why dogs chase their tails? They're trying to make ends meet\\!",
        'Why do dogs run in circles? Because it\'s hard to run in squares\\!',
        "What's a dog's favorite instrument? The trombone\\!"
      ]
      const jokeResponses = [
        'Why did the Bitcoin Cash cross the road? To reach the moon before Bitcoin\\!',
        "What's a Bitcoin Cash hodler's favorite dance move? The BCH shuffle\\!",
        "Why did the Bitcoin Cash developer break up with their significant other? They couldn't handle the big blocks\\!",
        'How does Bitcoin Cash like its coffee? With a lot of hash\\!',
        "What's a Bitcoin Cash enthusiast's favorite hobby? Forking around with big blocks\\!",
        'Why did the restaurant stop accepting Bitcoin? The fees were eating into their profits\\!',
        "What's a Bitcoin Cash miner's favorite game? Crash Bandicoot\\!",
        'What do you call a group of Bitcoin Cash supporters? A chain gang\\!',
        'Why did the Bitcoin Cash investor bring a shovel to the crypto conference? To dig for buried blocks\\!',
        "What's Bitcoin Cash's favorite mode of transportation? The BCHain\\!",
        'How does Bitcoin Cash handle stress? It just goes with the fork\\!',
        'Why did the bank robber switch to BCH? He got tired of waiting for his confirmations to come through\\.',
        'BCH struts into a cafe, pays for a pastry with a wink\\. Whispers to Bitcoin across the counter, "Enjoy waiting for your latte while I fight the custodial dragon on the Lightning Network\\."',
        'Why was the Bitcoin Cash community excited about the block size increase? More room for BCHain parties\\!',
        "What did the Bitcoin Cash say to the skeptic? Fork off, I'm the real deal\\!",
        'Why did the Bitcoin Cash miner bring a pickaxe to the blockchain? To mine their own business\\!',
        "What's a Bitcoin Cash enthusiast's favorite movie? The Fast and the Furious\\!",
        'Why did the man walk past the Bitcoin ATM and use the BCH one instead? He only had a penny to buy a cup of coffee\\!',
        'Why did the Bitcoin Cash investor bring a fishing rod to the crypto conference? To catch big blocks of fish and chips\\!',
        'What do you call a Bitcoin Cash transaction in the winter? A cold chain\\!',
        'Why did the Bitcoin Cash investor get a job at the circus? To juggle all those big blocks\\!'
      ]
      const mcdonaldsResponses = [
        "When BCH price drops, time to brush up that McDonald's job application\\!",
        "Looks like it's time to consider a side hustle at McDonald's\\. Wonder if they take applications in cryptocurrency?",
        "BCH price taking a dive? Don't worry, the drive thru will be there to help\\!",
        "When BCH hits a rough patch, remember: even McDonald's started small\\. And now they're flipping billions of patties\\! And they can use your help\\.",
        "Considering a career change to McDonald's due to BCH price? At least you'll get a guaranteed McMoon every month\\.",
        'Changing career to McDonald\'s? Their milkshake machine might actually work more often than your BCH fortune telling skills\\.',
        "BCH dip? Time to brush up on those McDonald's skills from last year and get a job at McDonald's\\!",
        "Don't let BCH price dips drive you to McDonald's\\. Hodl strong, because the crypto market is full of surprises\\!",
        "When BCH price is down, it's just a reminder that even Bitcoin Cash needs its McBreaks\\!",
        "Feeling down about BCH price? McDonald's offers great benefits and will cheer you up with their value meals \\(if you can afford them\\)\\.",
        'When BCH takes a dip, think of it as a chance to perfect your burger\\-flipping skills\\. Hodl strong\\!',
        "BCH price down? Time to think like McDonald's: \"Would you like some dipping sauce with that dip in the market?\"",
        'When BCH price drops, remember: it\'s just a temporary dip, not a Happy Meal deal breaker\\!',
        "Thinking about McDonald's due to BCH price? You might end up flipping burgers instead of flipping cryptocurrencies\\!",
        "Considering a job at McDonald's because of BCH prices? Remember, flipping burgers might be less volatile than flipping coins\\!",
        'Thinking about applying to McDonald\'s during a BCH bear market? Just remember, even their "dollar menu" doesn\'t offer this kind of discount\\!',
        "If BCH price has you considering McDonald's, just remember: their hiring process is faster than your BCH lambo dreams\\.",
        "When BCH prices drop, consider working at McDonald's—because at least there you'll know the value of every patty\\!",
        "Feeling the crunch of BCH price dip? Remember, McDonald's started small too, however, they're always hiring Bitcoin Cashers\\!",
        'BCH price fluctuating? Stay cool like an ice\\-cold McFlurry and fill\\-in that form already\\.'
      ]
      const insultResponses = [
        'Why did the Bitcoin Cash supporter become a chef? They wanted to fork pancakes instead of blockchains\\!',
        "What's the difference between Bitcoin and Bitcoin Cash? One is digital gold, the other is fool's gold\\!",
        'Why did the Bitcoin Cash developer go broke? They kept trying to scale but forgot to add value\\!',
        'Why did the Bitcoin Cash enthusiast go broke? They spent more time debating block sizes than learning about financial sense\\!',
        'How many Bitcoin Cash supporters does it take to change a light bulb? None, they prefer to fork in the dark\\!',
        'What do you call a group of Bitcoin Cash developers? A hard fork of friends\\!',
        "Why don't Bitcoin Cash supporters play hide and seek? They can't hide from the real Bitcoin\\!",
        'Why did the Bitcoin Cash investor carry an umbrella? For all the rain from Bitcoin maximalists\\!',
        'Why did the Bitcoin Cash miner get a job in customer service? They were used to dealing with forks\\!'
      ]
      const motivationResponses = [
        "Bitcoin Cash is not just a currency; it's a revolution in digital finance\\. Keep hodling\\!",
        "During downtimes, remember: Bitcoin Cash's history is filled with comebacks and triumphs\\.",
        'Every Bitcoin Cash dip is an opportunity to accumulate for the future\\. Stay patient and wait another 15 years\\!',
        'The resilience of Bitcoin Cash is unmatched\\. Trust in its long\\-term potential\\.',
        '"When in doubt, zoom out\\!" Bitcoin Cash\'s journey is about steady growth over time\\.',
        'Believe in the fundamentals\\. Bitcoin Cash is paving the way for a decentralized future and an electronic cash system\\.',
        'In the world of Bitcoin Cash, volatility is a sign of its evolving strength and adoption \\(I think?\\)\\.',
        "Think of Bitcoin Cash's fluctuations as turbulence before a smooth flight to new heights\\. Because the block height is constantly increasing, it's a good sign\\.",
        'Bitcoin Cash rewards those who stay committed through ups and downs\\. Despite the block rewards are going down 😊\\)\\.',
        "When Bitcoin Cash drops, it's a chance to buy low and strengthen your position for the future\\. So you have more BCH in absolute amount at least\\."
      ]
      const fakeNewsResponses = [
        'BREAKING: Scientists discover a way to mine BitcoinCash using renewable energy, eliminating carbon footprint',
        'Crypto adoption soars as major retailers announce acceptance of Bitcoin Cash for all purchases',
        'Bitcoin Cash hits new all\\-time high of $1 million, making early adopters the richest people on Earth',
        'New blockchain technology solves global poverty crisis, providing financial inclusion for billions',
        'CryptoKitties NFT Sells for Record $10 Million, Buyer Plans Virtual Cat Mansion in Decentraland',
        "Dogecoin becomes official currency of Mars colony, Elon Musk declares 'This is one small step for Doge, one giant leap for Dogekind\\!'",
        'Litecoin founder receives Nobel Prize for contributions to decentralized finance',
        'Stablecoin becomes preferred currency for international trade, reducing transaction costs globally',
        'Vitalik Buterin announces new Ethereum upgrade, \'Ethereum Infinity\', promising infinite scalability and zero transaction fees\\.',
        'Crypto philanthropist donates billions in Bitcoin Cash to fund clean water projects in developing countries'
      ]
      const shillResponses = [
        'Bitcoin Cash offers rapid transaction times and low fees, making it perfect for everyday transactions and micro\\-payments\\.',
        'With a larger block size, BCH can handle more transactions per second than BTC, ensuring it can scale effectively as adoption grows\\. If needed the block size can be further increased\\.',
        'BCH has a strong community of developers and enthusiasts dedicated to its growth and improvement, fostering innovation and resilience\\.',
        'BCH stays true to the decentralized ethos of cryptocurrencies, empowering individuals worldwide with financial freedom and electronic cash\\. All within layer 1\\.',
        'Many merchants and businesses accept BCH globally, providing practical use cases for its utility as a peer\\-to\\-peer electronic cash system\\.',
        'Bitcoin Cash prioritizes user experience with intuitive wallets and a focus on usability, making it accessible for newcomers and seasoned users alike\\.'
      ]
      const fudResponses = [
        'Bitcoin Cash scalability questioned in recent analysis, but ongoing upgrades like Avalanche consensus are addressing these concerns effectively\\.',
        'Reports suggest BCH adoption rates may be stagnating, yet recent partnerships and merchant integrations continue to expand its ecosystem\\.',
        "Security vulnerabilities allegedly found in Bitcoin Cash, though developers assert robust security measures ensure the network's integrity\\.",
        'Rumors of key developers leaving BCH project surfaced, but community sources indicate a diverse and committed development team remains active\\.',
        'Critics argue Bitcoin Cash lacks innovation compared to newer cryptocurrencies, while proponents highlight ongoing advancements like CashFusion for privacy\\.',
        'Concerns over regulatory challenges for BCH arise amid evolving global regulations, prompting community discussions on compliance strategies\\.',
        'Increased transaction fees on the BCH network reported during peak usage times, raising questions about its scalability under heavy demand\\.',
        "Internal disputes within the BCH community discussed, with factions debating strategic directions but unified in preserving BCH's decentralized ethos\\.",
        'Allegations of market manipulation affecting BCH prices investigated, highlighting volatility and market dynamics rather than deliberate manipulation\\.'
      ]

      if (msg.text) {
        const name = msg.from.first_name
        if (msg.text.toString() === '!' || msg.text.toString() === '/') {
          this.sendMessage(msg.chat.id, 'Info: Please use /help or \\!help to get more info\\.')
        } else if (msg.text.toString() === '/cat') {
          this.sendMessage(msg.chat.id, catResponses[Math.floor(Math.random() * catResponses.length)])
        } else if (msg.text.toString() === '/dog') {
          this.sendMessage(msg.chat.id, dogResponses[Math.floor(Math.random() * dogResponses.length)])
        } else if (msg.text.toString() === '/joke') {
          this.sendMessage(msg.chat.id, jokeResponses[Math.floor(Math.random() * jokeResponses.length)])
        } else if (msg.text.toString() === '/mcdonalds') {
          this.sendMessage(msg.chat.id, mcdonaldsResponses[Math.floor(Math.random() * mcdonaldsResponses.length)])
        } else if (msg.text.toString() === '/insult') {
          this.sendMessage(msg.chat.id, insultResponses[Math.floor(Math.random() * insultResponses.length)])
        } else if (msg.text.toString() === '/motivation') {
          this.sendMessage(msg.chat.id, motivationResponses[Math.floor(Math.random() * motivationResponses.length)])
        } else if (msg.text.toString() === '/news') {
          this.sendMessage(msg.chat.id, fakeNewsResponses[Math.floor(Math.random() * fakeNewsResponses.length)])
        } else if (msg.text.toString() === '/shill') {
          this.sendMessage(msg.chat.id, shillResponses[Math.floor(Math.random() * shillResponses.length)])
        } else if (msg.text.toString() === '/fud') {
          this.sendMessage(msg.chat.id, fudResponses[Math.floor(Math.random() * fudResponses.length)])
        } else if (msg.text.toString() === '/wallet') {
          this.sendMessage(msg.chat.id, `Total balance of ${name}: \\-$180,000.00. Have a nice day.`)
        } else if (msg.text.toString() === '/moon') {
          this.sendMessage(msg.chat.id, '🌕 BCH to the moon and beyond\\! Strap in, hodlers\\! We\'re orbiting towards financial freedom\\!')
        } else if (msg.text.toString() === '/easteregg') {
          this.sendMessage(msg.chat.id, `🐰 ${name} found the hidden Easter egg\\! As a reward, here's a virtual high\\-five 🖐️ and a secret crypto tip: hodl your memes as tightly as you hodl your Bitcoin Cash\\!`)
        }
      }
    })
  }
}
