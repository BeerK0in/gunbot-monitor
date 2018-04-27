# gunbot-monitor [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> gmon - A command line application to monitor your Gunbot

![gmon screenshot][gmon-screenshot-image]


## 👍 Basics

🚨 **gmon 1.x will only work with Gunbot v9!** 🚨

- gmon works best on Unix based systems (Linux and OSX)
- gmon requires Gunbot v9, Node.js 6 or higher and npm
- gmon uses up to 100MB memory
- you should not use gmon if your server has less than 230MB available free memory
- you need a wide window / screen
- gmon and it's creator are not responsible/liable for wrong numbers or wrong calculations
- use at own risk


## 💻 Installation

You need to install Gunbot-Monitor on the same machine as Gunbot.

This is a [Node.js](https://nodejs.org/en/) command line app available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 6.11.2 or higher is required.

Installation is done using the
[`npm install -g` command](https://docs.npmjs.com/getting-started/installing-npm-packages-globally):

```sh
$ npm install -g gunbot-monitor
```


## 💎 Update

Use npm to update:

```sh
$ npm uninstall -g gunbot-monitor && npm install -g gunbot-monitor
```


## 📋 Usage

To start gmon, go to the folder your Gunbot is installed (`cd /path/to/gunbot`) and run this command:

```sh
$ gmon [options]
```

**Options**

```sh
    -h, --help                               Output usage information
    -v, --version                            Output the version number
    -p, --path <path>                        Path to the GUNBOT folder. Separate multiple paths with ":" (like: -p /path1:/path2). [Default: current folder]
    -N, --path-name <name>                   Optional name for each path to the GUNBOT folder(s). Separate multiple path names with ":" (like: -N Kraken_Bot:Proxy_Mega_Bot). [Default: No path name]
    -c, --compact [groupSize]                Do not draw row lines. Optional set the number of rows after which a line is drawn. [Default: 0]
    -s, --small                              Reduce columns for small screens
    -d, --digits <digits>                    Amount of digits for all numbers. Min = 0, max = 10. [Default: 4]
    -r, --refresh <seconds>                  Seconds between table refresh. Min = 1, max = 600. [Default: 60]
    -m, --markets <markets>                  Filter of markets to show. Separate multiple markets with ":" (like: -m poloniex:kraken) [Default: all]
    -P, --profit                             Use to activate the parsing of the profit. NOT WORKING CORRECTLY!
    -H, --hide-inactive <hours>              Hides trading pairs which last log entry is older than given hours. Min = 1, max = 854400. [Default: 720]
    -C, --connections-check-delay <seconds>  Seconds between netstats checks. Higher numbers result in more inaccurate statistics but reduce cpu usage. Min = 1, max = 600. [Default: 1]
```


### Path option `-p`

To run gmon outside of your Gunbot folder, use the `-p` option to specify the path where Gunbot is installed:

```sh
$ gmon -p /path/to/gunbot
```

If you have multiple Gunbots running, you can use the `-p` option to specify all paths to your Gunbots:

```sh
$ gmon -p /path/to/AAA_bot:/path/to/BBB_bot
```

### Path name option `-N`

When using `-p` option you can set names for your different Gunbots:

```sh
$ gmon -N Kraken-Bot-tssl:Bittrex-emo
```

### Compact mode `-c`

With this option, gmon will not draw row lines to separate the rows:

```sh
$ gmon -c
```

Optional set the number of rows after which a line should be drawn to have a little visual guide:

```sh
$ gmon -c 4
```

### Small mode `-s`

With this option, gmon will not draw the columns *OO?*, *# Coins*, *1 6 h d +* to support smaller screens:

```sh
$ gmon -s
```

### Digits option `-d`

When using `-d` option you can set the number of displayed digits. Set to a lower number on small screens:

```sh
$ gmon -d 3
```

### Refresh option `-r`

This option allows you to set the time in seconds how long gmon waits until it checks all values again. 

⚡️ Please check your server when setting `-r` to low numbers! ⚡️ Faster updates mean more work for your server.

```sh
$ gmon -r 90
```

### Market filter `-m`

With option `-m` you are able to define specific markets you want to see in the output:

```sh
$ gmon -m kraken:bitfinex # This will only show pairs on those exchanges
```

### Profit option `-P`

Now working at the moment.

### Hide inactive pairs `-H`

gmon will show all trading pairs inside a folder, as long as there is a `state.json` file. If you disable a pair you can set this option `-H` to hide inactive trading pairs when there last update is older than the set number. 

```sh
$ gmon -H 2 
```

### Connections check delay `-C`

Set the time interval in seconds how often the number of open connections to the exchanges should be checked. Higher numbers result in more inaccurate statistics but reduce cpu usage.

```sh
$ gmon -C 10 
```

## 🤔 How to read gmon's output

| Column | Description |
| --- | --- |
| **Name** | Market name and trading pair name |
| **Str** | Buy and sell strategy |
| **LL** | Last Log - seconds since the last log update of this trading pair  |
| **OO?** | Open Order? - says "yes" if there is an open order on the market |
| |
| **# Coins** | Amount of coins of the quote currency |
| **in BTC** | Value of the quote currency in BTC (or other base currency) |
| **Diff since buy** | Indicator how much the value of the holding quote currency has changed in BTC (or other base currency) |
| |
| **Buy/Bought** | If numbers are white: Price which needs to be reached till the bot will buy quote currency _(if **# Coins** == 0)_ <br>If numbers are yellow: Price the bot paid to buy the quote currency" |
| **Sell** | Price which needs to be reached till the bot will sell the holding quote currency _(if **# Coins** > 0)_ |
| **Last Price** | Current market price for the quote currency |
| **Price diff** | Difference between Last Price and the Buy/Bought if waiting to buy <br>or difference between Last Price and the Sell if waiting to sell. <br>_If something is not correct (the log does not contain all needed prices) it shows an error hint_ |
| |
| **# Buys** | Number of total buys - How often did the bot buy this quote currency and time since the last buy |
| **1 6 h d +** | Number of buys in the last 1 hour / 6 hours / 12 hours / 24 hours / more than 24 hours. |
| **# Sells** | Number of total sells - How often did the bot sell this quote currency and time since the last sell |
| **1 6 h d +** | Number of sells in the last 1 hour / 6 hours / 12 hours / 24 hours / more than 24 hours |


## 😎 Windows issues

Do yourself a favor and use a console emulator like [cmder](https://github.com/cmderdev/cmder). 


## ✨ Wishlist

https://github.com/BeerK0in/gunbot-monitor/issues/15


## 🍺 Support & Tips

You like gmon and it helps you earning money?

- Report bugs in [this forum thread](https://gunthy.org/forum/index.php?topic=319.0) or via the Telegram group [t.me/beercrypto](https://t.me/beercrypto).
- Support gmon and send a tip to BTC wallet: 1GJCGZPn6okFefrRjPPWU73XgMrctSW1jT


## License

MIT © BeerK0in - [www.beer-crypto.com](https://www.beer-crypto.com)


[npm-image]: https://badge.fury.io/js/gunbot-monitor.svg
[npm-url]: https://npmjs.org/package/gunbot-monitor
[travis-image]: https://travis-ci.org/BeerK0in/gunbot-monitor.svg?branch=master
[travis-url]: https://travis-ci.org/BeerK0in/gunbot-monitor
[daviddm-image]: https://david-dm.org/BeerK0in/gunbot-monitor.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/BeerK0in/gunbot-monitor
[coveralls-image]: https://coveralls.io/repos/github/BeerK0in/gunbot-monitor/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/BeerK0in/gunbot-monitor?branch=master
[gmon-screenshot-image]: https://raw.githubusercontent.com/BeerK0in/gunbot-monitor/master/gmon-screenshot.png "Screenshot of gmon"
