const ccxt = require('ccxt')

const exchange = new ccxt.ftx()

module.exports.handler = async () => {
  try {
    let candles = [], hourly = []
    for (let index = 0; index < 7; index++) {
      candles = [ ...await exchange.fetchOHLCV(process.env.MARKET_SYMBOL, '1m', Date.now() - (1 + index) * 24 * 60 * 60000, 1440), ...candles ]
      hourly = [ ...await exchange.fetchOHLCV(process.env.MARKET_SYMBOL, '1h', Date.now() - (1 + index) * 24 * 60 * 60000, 24), ...hourly ]
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        symbol: process.env.MARKET_SYMBOL,
        candles,
        hourly,
      }),
    }
  } catch (error) {
   console.error(error)
   return { statusCode: 400 }
  }
}
