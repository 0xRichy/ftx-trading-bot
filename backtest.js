require('dotenv').config()
const ccxt = require('ccxt')
const fs = require('fs').promises
const { RSI, IchimokuCloud } = require('technicalindicators')

const exchange = new ccxt.ftx({
  apiKey: process.env.API_KEY,
  secret: process.env.API_SECRET,
  headers: { 'FTX-SUBACCOUNT': process.env.ACCOUNT_NAME },
})

;(async () => {
  let candles = []
  // for (let index = 0; index < 6 * 30; index++) {
  //   candles = [ ...await exchange.fetchOHLCV(process.env.MARKET_SYMBOL, '1m', Date.now() - (1 + index) * 24 * 60 * 60000, 1440), ...candles ]
  // }
  // await fs.writeFile(`./${process.env.MARKET_SYMBOL}.json`, JSON.stringify(candles))
  candles = JSON.parse(await fs.readFile(`./${process.env.MARKET_SYMBOL}.json`))
  console.log(candles.length)
  // candles = candles.slice(-90 * 24 * 60)

  let long, short, roi = 0
  candles.slice(121).forEach((candle, i, a) => {
    const ichimoku = IchimokuCloud.calculate({
      high: candles.slice(i, i + 121).map(c => c[2]),
      low: candles.slice(i, i + 121).map(c => c[3]),
      conversionPeriod: 9,
      basePeriod: 26,
      spanPeriod: 52,
    }).pop()
    const rsis = RSI.calculate({ period: 14, values: candles.slice(i, i + 121).map(c => c[4]) })
    const rsi = rsis.pop()
    const [ origin, o, high, low, close ] = candle
    const [ timestamp = Date.now(), open = o ] = a[i + 1] || []
    
    
    if (short && rsi <= 30) {
      const delta = 100 - open * 100 / short - 0.07 * 2
      console.log(new Date(timestamp), 'buy', open, Math.round(rsi), (delta >= 0 ? '+' : '') + delta.toFixed(2) + '%')
      roi += delta
      short = 0
    }
    if (long && rsi >= 70) {
      const delta = open * 100 / long - 100 - 0.07 * 2
      console.log(new Date(timestamp), 'sell', open, Math.round(rsi), (delta >= 0 ? '+' : '') + delta.toFixed(2) + '%')
      roi += delta
      long = 0
    }
    if (Math.abs(ichimoku.conversion - ichimoku.base) >= 10 && rsis.slice(-10).some(r => r >= 80) && !short) {
      console.log(new Date(timestamp), 'SHORT', open, Math.round(rsi))
      short = open
    }
    if (ichimoku.conversion - 10 >= ichimoku.base && rsis.slice(-45).some(r => r <= 20) && !long) {
      console.log(new Date(timestamp), 'LONG', open, Math.round(rsi))
      long = open
    }

    if (i === a.length - 1) {
      console.log(roi.toFixed(2) + '%')
      console.log(new Date(timestamp), new Date(origin), close, rsi)
    }
  })
})()


// exchange.private_get_positions().then(console.log)
