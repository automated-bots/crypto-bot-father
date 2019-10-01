# Bitcoin Bot

Botfather for [Bitcoin](https://bitcoin.org) - Which knows everything you want to know

## What?

A Botfather chat bot for Bitcoin. The one that rule them all!

## Why?

Bitcoin Bot can be used in [Telegram](https://telegram.org/apps) parse requests from clients and return useful information about Bitcoin.

This information could be anything like network stats, address info, market data and much more!

And thus eventually to serve the Bitcoin user (yes, you)!

## How?

Bitcoin Bot is written in javascript using [Node.js](https://nodejs.org/en/download/).

Bitcoin Bot initually will use the [Bitcoin Core](https://github.com/bitcoin/bitcoin) in order to retrieve information from the Bitcoin network.

We will never support the scamming Bitcoin Cash!

## Who?

Hi, it's me: Melroy van den Berg.

## When?

Currently busy programming.... Please hold my bear.

## Develop

Requirements:

* [Node.js v10](https://nodejs.org/en/download/)
* npm (package manager)
* [Bitcoin Core](https://github.com/bitcoin/bitcoin)

```sh
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs npm
```

### Running

Create Telegram bot via [@bothfather](https://telegram.me/BotFather). Fill-in the applicable tokens in `tokens.env` file, by using the template (see [tokens.env.example](tokens.env.example)):

```sh
TELEGRAM_TOKEN=xyz
COINMARKETCAP_API_TOKEN=xyz
RPC_PASSWORD=xyz
```

Finally, starting the bot server: `npm start` (or `node src/index.js`)

**Note 1:** Reverse proxy (eg. Nginx) is required to put between the bot and the world-wide-web. Expose the webserver on port 443 (with SSL). See [nginx_example.conf](nginx_example.conf).

**Note 2:** Assuming you are running the bitcoind deamon (see requirements), with JSON RPC enabled and txindex enabled. Example of `~/.bitcoin/bitcoin.conf`:

```sh
# You can generate this value with the ./share/rpcauth/rpcauth.py script in the Bitcoin Core repository.
rpcauth=bitcoin:hashedpassword
daemon=1
server=1
txindex=1
disablewallet=1
```

### Linting

Run lint: `npm run lint`

Fix lint issues: `npm run fix`

### Unit Testing

Run test: `npm test`

## Production

Starting the bot, can be done via:

* `./start_bot_prod.sh`

The bot can be started via crontab for example:

```sh
@reboot sh /path/to/start_bot_prod.sh
```

**General setup:**

* Be-sure both `bitcoind` binary is installed into `/usr/bin` directory!
* Create an user `bitcoin` the unix machine (`adduser -M bitcoin`)

### Core setup

* Place the Bitcoind file (`bitcoin.conf`) in `/etc/bitcoin` for the Bitcoin Core Daemon service, example of this file:

```sh
# [core]
# You can generate this value with the ./share/rpcauth/rpcauth.py script in the Bitcoin Core repository.
rpcauth=bitcoin:hashedpassword
# Run in the background as a daemon and accept commands.
daemon=1
# [rpc]
# Accept command line and JSON-RPC commands.
server=1
# Maintain a full transaction index, used by the getrawtransaction rpc call.
txindex=1
# [wallet]
# Do not load the wallet and disable wallet RPC calls.
disablewallet=1
```

* See [bitcoin.service systemd file](bitcoin.service) for Debian based distributions. Place this file into `/etc/systemd/system` folder.
* Core data will be stored into `/var/lib/bitcoind`

## Useful links

* [Bitcoin Core Blog](https://bitcoincore.org/en/blog/)
* [Bitcoin.org FAQ](https://bitcoin.org/en/faq)
