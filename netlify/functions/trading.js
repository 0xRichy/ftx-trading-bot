require('dotenv').config()
const ccxt = require('ccxt')
const { RSI, IchimokuCloud, ATR } = require('technicalindicators')

const exchange = new ccxt.ftx({
  apiKey: process.env.API_KEY,
  secret: process.env.API_SECRET,
  headers: { 'FTX-SUBACCOUNT': process.env.ACCOUNT_NAME },
})

const handler = async () => {
  try {
    const candles = await exchange.fetchOHLCV(process.env.MARKET_SYMBOL, '1m', Date.now() - 122 * 60000)
    const hourly = await exchange.fetchOHLCV(process.env.MARKET_SYMBOL, '1h', Date.now() - 16 * 60 * 60000)
    hourly.pop()
    
    const { conversion, base } = IchimokuCloud.calculate({
      high: candles.map(c => c[2]),
      low: candles.map(c => c[3]),
      conversionPeriod: 9,
      basePeriod: 26,
      spanPeriod: 52,
    }).pop()
    const rsis = RSI.calculate({ period: 14, values: candles.map(c => c[4]) })
    const rsi = rsis[rsis.length - 1]
    const atrs = ATR.calculate({
      period: 14,
      high: hourly.map(c => c[2]),
      low: hourly.map(c => c[3]),
      close: hourly.map(c => c[4]),
    })
    const atr = atrs.pop() * 100 / base

    const [ timestamp, open, high, low, close ] = candles[candles.length - 1]
    const { result: [ position ] } = await exchange.private_get_positions()
  
    let long = position.side === 'buy' && +position.size
    let short = position.side === 'sell' && +position.size
    
    console.log(
      new Date(),
      { ...long && { long }, ...short && { short } },
      new Date(timestamp),
      close.toFixed(1),
      {
        rsi: rsi.toFixed(1),
        conversion: conversion.toFixed(1),
        base: base.toFixed(1),
        atr: atr.toFixed(1),
      },
    )
  
    if (short
      && rsis.slice(-60 + rsis.slice(-60).findIndex(r => r >= 70)).some(r => r <= 30)
      && 100 * conversion / base - 100 >= atr * 3 / 10
    ) {
      const { id, amount } = await exchange.createMarketOrder(process.env.MARKET_SYMBOL, 'buy', process.env.ORDER_SIZE)
      short = 0
      console.warn(new Date(), 'buy', amount, id)
    }
    if (long
      && rsis.slice(-60 + rsis.slice(-60).findIndex(r => r <= 30)).some(r => r >= 70)
      && 100 * conversion / base - 100 <= -atr * 3 / 10
    ) {
      const { id, amount } = await exchange.createMarketOrder(process.env.MARKET_SYMBOL, 'sell', process.env.ORDER_SIZE)
      long = 0
      console.warn(new Date(), 'sell', amount, id)
    }
  
    if (!short
      && rsis.slice(-60 + rsis.slice(-60).findIndex(r => r <= 30)).some(r => r >= 80)
      && Math.abs(100 * conversion / base - 100) >= atr * 3 / 10
    ) {
      const { id, amount } = await exchange.createMarketOrder(process.env.MARKET_SYMBOL, 'sell', process.env.ORDER_SIZE)
      short = amount
      console.warn(new Date(), 'SHORT', amount, id)
    }
    if (!long
      && rsis.slice(-60 + rsis.slice(-60).findIndex(r => r >= 70)).some(r => r <= 20)
      && 100 * conversion / base - 100 >= atr * 3 / 10
    ) {
      const { id, amount } = await exchange.createMarketOrder(process.env.MARKET_SYMBOL, 'buy', process.env.ORDER_SIZE)
      long = amount
      console.warn(new Date(), 'LONG', amount, id)
    }
  
    return { statusCode: 200 }
  
  } catch (error) {
    console.error(error)
    return { statusCode: 400 }
  }
}

module.exports.handler = handler
