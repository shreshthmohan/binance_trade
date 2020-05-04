// TODO: Clear orders in orders.json after
// excluding buy orders that have been executed.
// Add new orders and append them to existing list in orders.json

// 1. Find open buy orders
// 2. Remove open buy orders from orders.json
// 3. Add new orders based on current price
// 4. Setup this script to run daily

// require("es6-promise/auto");

const fs = require("fs");
const Binance = require("binance-api-node").default;
const weightedAverage = require("./helpers/weightedAverage");
const expOrders = require("./helpers/expOrders");

const apiKey = process.env.BN_API_KEY;
const apiSecret = process.env.BN_API_SECRET;

const clientAuthed = Binance({
  apiKey: apiKey,
  apiSecret: apiSecret,
});
const clientPublic = Binance();

const RECENT_TRADES_COUNT = 20;
const getCurrentPrice = async function (symbol) {
  const trades = await clientPublic.trades({
    symbol: symbol,
    limit: RECENT_TRADES_COUNT,
  });
  return {
    price: weightedAverage({
      list: trades,
      priceKey: "price",
      quantityKey: "qty",
    }),
    symbol: symbol,
  };
};

const getCoinAmount = async function (coinToSearch) {
  const walletInfo = await clientAuthed.accountInfo();
  const allCoins = walletInfo.balances;
  const found = allCoins.find(function (item) {
    return item.asset === coinToSearch;
  });
  if (found) {
    return parseFloat(found.free);
  }
  return 0;
};

const placeBuyOrder = async function ({ symbol, quoteQty, price }) {
  const qty = quoteQty / price;
  if (quoteQty < 10.01) {
    return;
  }
  const orderResponse = await clientAuthed.order({
    symbol: symbol,
    side: "BUY",
    quantity: qty.toFixed(6),
    price: price.toFixed(2),
    type: "LIMIT",
  });
  return orderResponse;
};

const wrapper = async function () {
  const CURRENT_SYMBOL = "BTCUSDT";
  const CURRENT_QUOTE_CURRENCY = "USDT";
  // const currentPrice = { price: 8950, symbol: CURRENT_SYMBOL };
  const currentPrice = await getCurrentPrice(CURRENT_SYMBOL);

  const coinAmount = await getCoinAmount(CURRENT_QUOTE_CURRENCY);

  console.log(`Current ${currentPrice.symbol} price: ${currentPrice.price}`);
  console.log(`\nCurrent ${CURRENT_QUOTE_CURRENCY} balance: ${coinAmount}`);
  const SAVE_FOR_DCA = 100;
  const EXP_ORDER_AMOUNT = coinAmount - SAVE_FOR_DCA;
  if (EXP_ORDER_AMOUNT > 100) {
    console.log(`\nCan place exponential orders worth ${EXP_ORDER_AMOUNT}`);
    // Split this into two equal parts.
    // One for near the current price - lower rate
    // Second for far away from current price - higher rate

    // First part
    const SMALL_DISTANCE_FROM_CURRENT_PRICE = 15; // % below current price
    const nearbyPrice =
      currentPrice.price * (1 - SMALL_DISTANCE_FROM_CURRENT_PRICE / 100);
    console.log(
      `Nearby price ${SMALL_DISTANCE_FROM_CURRENT_PRICE}% below the current price is ${nearbyPrice}`
    );
    const nearbyAmount = EXP_ORDER_AMOUNT / 2;
    const nearbyOrders = expOrders({
      amount: nearbyAmount,
      startAmount: 10.01,
      priceHigh: currentPrice.price,
      priceLow: nearbyPrice,
      rate: 3,
    });
    const nearbyTotal = nearbyOrders.reduce(function (acc, odr) {
      return acc + odr.amount;
    }, 0);
    console.log("nearby orders:", nearbyOrders);
    const farawayAmount = EXP_ORDER_AMOUNT - nearbyTotal;

    // Remember to exclude first order as it will be repeated because of two parts
    const LARGE_DISTANCE_FROM_CURRENT_PRICE = 55;
    const largeDistancePrice =
      currentPrice.price * (1 - LARGE_DISTANCE_FROM_CURRENT_PRICE / 100);

    console.log(
      `Far away price ${LARGE_DISTANCE_FROM_CURRENT_PRICE}% below the current price is ${largeDistancePrice}`
    );
    const nearbyInterval =
      (currentPrice.price - nearbyPrice) / nearbyOrders.length;
    const farawayRate = 10;
    const farawayOrders = expOrders({
      amount: farawayAmount,
      startAmount:
        nearbyOrders[nearbyOrders.length - 1].amount * (1 + farawayRate / 100),
      priceHigh: nearbyOrders[nearbyOrders.length - 1].price - nearbyInterval,
      priceLow: largeDistancePrice,
      rate: farawayRate,
      includeLastOdd: true,
    });
    console.log("faraway orders:", farawayOrders);
    const allOrders = [
      ...JSON.parse(JSON.stringify(nearbyOrders)),
      ...JSON.parse(JSON.stringify(farawayOrders)),
    ];
    const orderPromises = allOrders.map(function (odr) {
      return placeBuyOrder({
        symbol: CURRENT_SYMBOL,
        quoteQty: odr.amount,
        price: odr.price,
      });
    });
    const orderResponses = await Promise.all(orderPromises);

    fs.writeFileSync("orders.json", JSON.stringify(orderResponses));
  }
};

wrapper();
