# gunbot-monitor [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Monitors your GUNBOTs

**Warning - The current state of the Monitor is an early BETA version.**
So,
- it is only tested on Ubuntu and OSX
- it requires nodejs 6 and npm
- the monitor and I as creator of it are not responsible/liable for wrong numbers or wrong calculations
- it uses up to 100MB memory
- you should not use it if your server has less than 230MB available free memory
- it shows stats I'm interested in, so chances are high you'll miss some information
- it is not very efficient in parsing all the logs, so it could slow down your server
- it is only tested with Poloniex logs (I'm pretty sure it will not work for other markets)
- you need a wide window / screen
- Finally: use at own risk

## Installation

```sh
$ npm install -g gunbot-monitor
```

## Usage

```sh
$ gmon [-p /path/to/gunbot/logs]
```

Run the command inside the folder of your gunbot logs, or use `-p /path/to/gunbot/logs` to specify the path.
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
