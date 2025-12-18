# Crypto Bot Father

Botfather for all cryptocurrencies for Telegram - Ask him anything about crypto

## What?

A Telegram chat bot for cryptocurrencies. The one that rule them all!

Live at: [@CyptoExplorer_bot](https://t.me/CyptoExplorer_bot)

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

- [NodeJS LTS](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io)
- Docker Engine + Docker Compose (if you wish to use/test the Docker image)
- [Bitcoin Cash Node](https://gitlab.com/bitcoin-cash-node/bitcoin-cash-node)
- Telegram bot via [@BotFather](https://telegram.me/BotFather)

### Running

Create Telegram bot via [@BotFather](https://telegram.me/BotFather). Fill-in the applicable tokens/secrets in `.env` file, by using the template (see [.env.example](.env.example)):

```sh
BOT_SECRET_URL=change_this_to_a_secure_random_string
TELEGRAM_TOKEN=xyz
TELEGRAM_BOT_URL=https://yourdomain.com
BITCOIN_RPC_HOST=localhost
BITCOIN_RPC_PORT=8332
BITCOIN_RPC_USERNAME=bitcoin
BITCOIN_RPC_PASSWORD=xyz
LOG_LEVEL=warn
CHART_IMAGE_API_KEY=aaaabbbbcccc
```

Where:

- `BOT_SECRET_URL` = A random secret string (hash) which gets added to the webhook bot URL, so the POST webhook path can't easily be found by others. This is **NOT** the same as the bot API token. You can set `BOT_SECRET_URL` to any secret value.
- `TELEGRAM_TOKEN` = Secret Bot API token (required).
- `TELEGRAM_BOT_URL` = Your public domain name you use to communicate against the Telegram web API server (required).
- `BITCOIN_RPC_HOST` = Bitcoin core host (default: `localhost`), optionally.
- `BITCOIN_RPC_PORT` = Bitcoin core RPC port (default: `8332`), optionally.
- `BITCOIN_RPC_USERNAME` = Bitcoin core daemon RPC username (default: `bitcoin`)
- `BITCOIN_RPC_PASSWORD` = Bitcoin core daemon RPC password (default empty)
- `FULCRUM_RPC_HOST` = Fulcrum RPC host (default: `localhost`), optionally.
- `FULCRUM_RPC_PORT` = Fulcrum RPC port (default: `50001`), optionally.
- `LOG_LEVEL` = [Pino Log level](https://github.com/pinojs/pino/blob/main/docs/api.md#loggerlevel-string-gettersetter) (default: `info`), optionally. Could be useful to reduce the amount of log output in production (eg. `warn` or `error`).
- `CHART_IMAGE_API_KEY` = API key for retrieving TradingView images from [Chart-img](https://chart-img.com/).

Finally, starting the bot server: `pnpm start`

**Note 1:** Reverse proxy (eg. Nginx) is required to put between the bot and the world-wide-web. Expose the webserver on port 443 (with SSL). See [nginx_example.conf](nginx_example.conf).

**Note 2:** Assuming you are running the bitcoind deamon (see requirements), with JSON RPC enabled and txindex enabled. Example of the local client `~/.bitcoin/bitcoin.conf` config:

```sh
# Change RPC login credentials
rpcuser=your_username
rpcpassword=your_password
```

### Linting

Run lint: `pnpm lint`

Fix lint issues: `pnpm fix`

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
