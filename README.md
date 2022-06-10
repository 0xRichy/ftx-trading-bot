
[`ftx-trading-bot`](https://github.com/yip-theodore/ftx-trading-bot) is a futures trading bot that runs on [Netlify](https://netlify.com)

## Quick setup

Log in to your [FTX](https://ftx.com) account (or sign up [here](https://ftx.com/profile#a=18488236) for 5% off fees), and create an API key on the *Settings* page

Once done, click the button below, and fill in these environment variables:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yip-theodore/ftx-trading-bot)

Name | Description
--- | ---
`MARKET_SYMBOL` | Futures market symbol (e.g. `ETH-PERP`)
`ACCOUNT_NAME` | Subaccount name (optional)
`API_KEY` | Your FTX API key
`API_SECRET` | Your FTX API secret
`ORDER_SIZE` | Long/short order size (e.g. `0.1`)

Finally, enable **Scheduled Functions** under the *Functions* tab in your Netlify project, and redeploy the site by clicking on **Trigger deploy**

## Have any questions?

Reach me on [Discord](https://discord.com) at Theo dort#9495
