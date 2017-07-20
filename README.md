# gunbot-monitor [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Monitors your GUNBOTs

**Warning - The current state of the Monitor is still a BETA version.**

So,
- it works best on Unix based systems (Linux and OSX)
- it requires nodejs 6 or newer and npm
- the monitor and I as creator of it are not responsible/liable for wrong numbers or wrong calculations
- it uses up to 100MB memory
- you should not use it if your server has less than 230MB available free memory
- it shows stats I'm interested in, so chances are high you'll miss some information
- it is not very efficient in parsing the logs for the "profit information", so using `-P` will slow down your server
- you need a wide window / screen
- Finally: use at own risk

## Installation and Update

```sh
$ npm install -g gunbot-monitor
```
Use the same command to update to the latest version.

## Usage

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
    -m, --markets <markets>                  List of markets to show. Separate multiple markets with ":" (like: -m poloniex:kraken) [Default: poloniex:kraken:bittrex]
    -P, --profit                             Use to activate the parsing of the profit. THIS WILL SLOW DOWN YOUR SYSTEM!
    -H, --hide-inactive <hours>              Hides trading pairs which last log entry is older than given hours. Min = 1, max = 854400. [Default: 720]
    -E, --show-all-errors                    Use to list 422 errors in the last column.
    -C, --connections-check-delay <seconds>  Seconds between netstats checks. Higher numbers result in more inaccurate statistics but reduce cpu usage. Min = 1, max = 600. [Default: 1]
```

Run the command inside the folder of your gunbot logs, or use `-p /path/to/gunbot/logs` to specify the path.

## Wishlist

https://github.com/BeerK0in/gunbot-monitor/issues/15

## Support & Tips

You like gmon and it helps you earning money?

- Report bugs in [this forum thread](https://gunthy.org/index.php?topic=319.0) or via pm in the Gunbot Telegram group at @BeerK0in
- Support gmon and send a tip to BTC wallet: 1GJCGZPn6okFefrRjPPWU73XgMrctSW1jT

## License

MIT © [BeerK0in](https://github.com/BeerK0in)


[npm-image]: https://badge.fury.io/js/gunbot-monitor.svg
[npm-url]: https://npmjs.org/package/gunbot-monitor
[travis-image]: https://travis-ci.org/BeerK0in/gunbot-monitor.svg?branch=master
[travis-url]: https://travis-ci.org/BeerK0in/gunbot-monitor
[daviddm-image]: https://david-dm.org/BeerK0in/gunbot-monitor.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/BeerK0in/gunbot-monitor
[coveralls-image]: https://coveralls.io/repos/github/BeerK0in/gunbot-monitor/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/BeerK0in/gunbot-monitor?branch=master
