# Crypto Bot Father

Botfather for all cryptocurrencies for Telegram - Ask him anything about crypto

## What?

A Telegram chat bot for crypto. The one that rule them all!

## Why?

Crypto Bot Father can be used in [Telegram](https://telegram.org/apps) parse requests from clients and return useful information about crypto (like Bitcoin).

This information could be anything like market price quotes, network stats, block or address details and much more!

## How?

This bot is written in javascript using [Node.js](https://nodejs.org/en/download/).

The bot uses different public API endpoints for any cryptocurrency. As well as on-chain data from the [Bitcoin Core](https://github.com/bitcoin/bitcoin) in order to retrieve information from the Bitcoin network.

## Who?

Hi, it's me: Melroy van den Berg.

## Docker image

There is a Docker image [available on DockerHub](https://hub.docker.com/repository/docker/danger89/crypto-bot-father).

## Developer

### Requirements

- [Node.js](https://nodejs.org/en/download/)
- npm (package manager)
- [Bitcoin Cash Node](https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node)
- Telegram bot via [@bothfather](https://telegram.me/BotFather)

### Running

Create Telegram bot via [@bothfather](https://telegram.me/BotFather). Fill-in the applicable tokens/secrets in `secrets.env` file, by using the template (see [secrets.env.example](secrets.env.example)):

```sh
TELEGRAM_TOKEN=xyz
COINMARKETCAP_API_TOKEN=xyz
BITCOIN_RPC_HOST=localhost
BITCOIN_RPC_PORT=8332
BITCOIN_RPC_USERNAME=bitcoin
BITCOIN_RPC_PASSWORD=xyz
TELEGRAM_BOT_URL=https://yourdomain.com
```

Where:

- `TELEGRAM_TOKEN` = Secret Bot API token
- `COINMARKETCAP_API_TOKEN` = Secret Coinmarketcap.com API token
- `BITCOIN_RPC_HOST` = Bitcoin core host (default: localhost), optionally.
- `BITCOIN_RPC_PORT` = Bitcoin core RPC port (default: 8332), optionally.
- `BITCOIN_RPC_USERNAME` = Bitcoin core daemon RPC username (default: bitcoin)
- `BITCOIN_RPC_PASSWORD` = Bitcoin core daemon RPC password
- `TELEGRAM_BOT_URL` = your public domain name you use to communicate against the Telegram web API server.

Finally, starting the bot server: `npm start` (or `node src/index.js`)

**Note 1:** Reverse proxy (eg. Nginx) is required to put between the bot and the world-wide-web. Expose the webserver on port 443 (with SSL). See [nginx_example.conf](nginx_example.conf).

**Note 2:** Assuming you are running the bitcoind deamon (see requirements), with JSON RPC enabled and txindex enabled. Example of `~/.bitcoin/bitcoin.conf`:

```sh
# Default username/password: bitcoin/xyz
rpcauth=bitcoin:b69449980fba89a8459c0461389e78e6$87b68368b06ae8325fd5499637a9511b16763db17c877f00c50e23294fc3652b
daemon=1
datadir=/media/Data_disk/bitcoin/
server=1
txindex=1
```

### Linting

Run lint: `npm run lint`

Fix lint issues: `npm run fix`

### Core setup

- Place the Bitcoind file (`bitcoin.conf`) in `/etc/bitcoin` for the Bitcoin Core Daemon service, example of this file:

```sh
# [core]
# You can generate this value with the ./share/rpcauth/rpcauth.py script in the Bitcoin Core repository.
rpcauth=bitcoin:hashedpassword
# Run in the background as a daemon and accept commands.
daemon=1
# Specify a non-default location to store blockchain and other data.
datadir=/your_custom/path/
# [rpc]
# Accept command line and JSON-RPC commands.
server=1
# Maintain a full transaction index, used by the getrawtransaction rpc call.
txindex=1
```

Next, do not forget to create a (test) wallet:

```sh
bitcoin-cli createwallet "testwallet"
```

- See [bitcoind.service systemd file](bitcoind.service) for Debian based distributions. Place this file into `/etc/systemd/system` folder.
- Core data will be stored into `/var/lib/bitcoind`
- Be-sure both `bitcoind` binary is installed into `/usr/bin` directory!
- Create an user `bitcoin` the unix machine (`adduser -M bitcoin`)

## Useful links

- [BCHN Docs](https://docs.bitcoincashnode.org/)
