const Binance = require("binance-api-node").default;

const apiKey = process.env.BN_API_KEY;
const apiSecret = process.env.BN_API_SECRET;
// console.log("apikey:", apiKey);
// console.log("apisecret:", apiSecret);

const clientAuthed = Binance({
  apiKey: apiKey,
  apiSecret: apiSecret,
});
const client = Binance();
// client.avgPrice({ symbol: "BTCUSDT" }).then(function (res) {
//   console.log("last 5 min avg price BTCUSDT:", res);
// });
// client.trades({ symbol: "BTCUSDT", limit: 10 }).then(function (res) {
//   console.log("trades BTCUSDT:", res);
// });
// const CANDLE_COUNT = 60;
// client
//   .candles({ symbol: "BTCUSDT", limit: CANDLE_COUNT, interval: "3m" })
//   .then(function (res) {
//     // console.log("candles BTCUSDT:", res);
//     const sum = res.reduce(
//       function (acc, cur) {
//         return {
//           low: acc.low + parseFloat(cur.low),
//           high: acc.high + parseFloat(cur.high),
//           open: acc.open + parseFloat(cur.open),
//           close: acc.close + parseFloat(cur.close),
//         };
//       },
//       { low: 0, high: 0, open: 0, close: 0 }
//     );
//     const avg = {
//       low: sum.low / CANDLE_COUNT,
//       high: sum.high / CANDLE_COUNT,
//       open: sum.open / CANDLE_COUNT,
//       close: sum.close / CANDLE_COUNT,
//     };
//     console.log("avg:", avg);
//   });

// const orderDetails = {
//   symbol: "BTCUSDT",
//   side: "BUY",
//   type: "MARKET",
//   quant,
// };

clientAuthed
  .order({
    symbol: "BTCUSDT",
    side: "BUY",
    quantity: 0.0026,
    price: 4000,
    type: "LIMIT",
  })
  .then(function (res) {
    console.log("res:", res);
  });
// Order response:
// {
//   symbol: 'BTCUSDT',
//   orderId: 2012286328,
//   orderListId: -1,
//   clientOrderId: 'GPr0krvNMlxeK5aPvU0gHp',
//   transactTime: 1588502841998,
//   price: '4000.00000000',
//   origQty: '0.00260000',
//   executedQty: '0.00000000',
//   cummulativeQuoteQty: '0.00000000',
//   status: 'NEW',
//   timeInForce: 'GTC',
//   type: 'LIMIT',
//   side: 'BUY',
//   fills: []
// }

// clientAuthed.accountInfo().then(function (res) {
//   console.log("accountInfo:", res);
// });

// clientAuthed.time().then((time) => console.log(time));
