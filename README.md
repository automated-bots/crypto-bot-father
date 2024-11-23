# Crypto Bot Father

Botfather for all cryptocurrencies for Telegram - Ask him anything about crypto

## What?

A Telegram chat bot for crypto. The one that rule them all!

## Why?

Crypto Bot Father can be used in [Telegram](https://telegram.org/apps) parse requests from clients and return useful information about crypto (like Bitcoin).

This information could be anything like market price quotes, network stats, block or address details and much more!

## How?

This bot is written in JavaScript using [Node.js](https://nodejs.org/en/download/).

The bot is using [JS Finance](finance.melroy.org/docs) to retrieve general cryptocurrency data like the latest prices. On-chain data is retrieved from the [Bitcoin Cash Node](https://bitcoincashnode.org) (BCHN) in order to retrieve information from the Bitcoin Cash network.

Crypto Bot Father will also leverage the [BCH Explorer REST API](https://explorer.melroy.org) as well as [Fulcrum](https://github.com/cculianu/Fulcrum) to retrieve additional data, which is otherwise too complicated to retrieve from BCHN directly.

## Who?

Hi, it's me: [Melroy van den Berg](https://melroy.org).

## Docker image

There is a Docker image [available on DockerHub](https://hub.docker.com/repository/docker/danger89/crypto-bot-father).

## Developer

### Requirements

- Docker Engine + Docker Compose
- [Bitcoin Cash Node](https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node)
- Telegram bot via [@bothfather](https://telegram.me/BotFather)

### Running

Create Telegram bot via [@bothfather](https://telegram.me/BotFather). Fill-in the applicable tokens/secrets in `.env` file, by using the template (see [.env.example](.env.example)):

```sh
TELEGRAM_TOKEN=xyz
TELEGRAM_BOT_URL=https://yourdomain.com
BITCOIN_RPC_HOST=localhost
BITCOIN_RPC_PORT=8332
BITCOIN_RPC_USERNAME=bitcoin
BITCOIN_RPC_PASSWORD=xyz
CHART_IMAGE_API_KEY=aaaabbbbcccc
```

Where:

- `TELEGRAM_TOKEN` = Secret Bot API token
- `TELEGRAM_BOT_URL` = your public domain name you use to communicate against the Telegram web API server.
- `BITCOIN_RPC_HOST` = Bitcoin core host (default: `localhost`), optionally.
- `BITCOIN_RPC_PORT` = Bitcoin core RPC port (default: `8332`), optionally.
- `BITCOIN_RPC_USERNAME` = Bitcoin core daemon RPC username (default: `bitcoin`)
- `BITCOIN_RPC_PASSWORD` = Bitcoin core daemon RPC password (default empty)
- `FULCRUM_RPC_HOST` = Fulcrum RPC host (default: `localhost`), optionally.
- `FULCRUM_RPC_PORT` = Fulcrum RPC port (default: `50001`), optionally.
- `CHART_IMAGE_API_KEY` = API key for retrieving TradingView images from [Chart-img](https://chart-img.com/).

Finally, starting the bot server: `npm start` (or `node .`)

**Note 1:** Reverse proxy (eg. Nginx) is required to put between the bot and the world-wide-web. Expose the webserver on port 443 (with SSL). See [nginx_example.conf](nginx_example.conf).

**Note 2:** Assuming you are running the bitcoind deamon (see requirements), with JSON RPC enabled and txindex enabled. Example of the local client `~/.bitcoin/bitcoin.conf` config:

```sh
# Change RPC login credentials
rpcuser=your_username
rpcpassword=your_password
```

### Linting

Run lint: `npm run lint`

Fix lint issues: `npm run fix`

### Bitcoin Cash Node setup

- Create or edit the Bitcoin Daemon (BCHN) configuration file: `/etc/bitcoin/bitcoin.conf`, used by the Bitcoin Cash Node Daemon service. Example of the content of this file:

```sh
# Disable listening
listen=0

# Max connections to other nodes
maxconnections=6
# Limit the upload
maxuploadtarget=20

# Transaction index (full index)
txindex=1

server=1

# Bind to all interfaces
rpcbind=0.0.0.0

# Enable JSON-RPC authentication
#rpcauth=your_username:hashed_password

rpcthreads=6

# Allow all IPs
rpcallowip=0.0.0.0/0
rpcallowip=::/0

```

- See [bitcoind.service systemd file](bitcoind.service) for Debian based distributions. Place this file into `/etc/systemd/system` folder.
- Core data will be stored into `/var/lib/bitcoind`
- Be-sure the `bitcoind` binary is installed into `/usr/bin` directory
- Create an user `bitcoin` the unix machine (`adduser -M bitcoin`)

## Useful links

- [BCHN Docs](https://docs.bitcoincashnode.org/)
