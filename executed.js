const fs = require("fs");

const placedOrders = JSON.parse(fs.readFileSync("orders.json"));
// console.log("placed orders length:", JSON.parse(placedOrders).length);
const Binance = require("binance-api-node").default;

const apiKey = process.env.BN_API_KEY;
const apiSecret = process.env.BN_API_SECRET;

const clientAuthed = Binance({
  apiKey: apiKey,
  apiSecret: apiSecret,
});

const getOpenBuyOrders = async function (symbol) {
  const openOrders = await clientAuthed.openOrders({
    symbol: "BTCUSDT",
  });

  const openBuyOrders = openOrders.filter(function (odr) {
    return odr.side === "BUY";
  });
  // console.log("open orders:", openBuyOrders);
  return openBuyOrders;
};

const placeSellOrder = async function ({
  symbol,
  quoteQty,
  price,
  forOrderId,
}) {
  const qty = quoteQty / price;
  if (quoteQty < 10.01) {
    return;
  }
  const orderResponse = await clientAuthed.order({
    symbol: symbol,
    side: "SELL",
    quantity: qty.toFixed(5),
    price: price.toFixed(2),
    type: "LIMIT",
  });
  return { ...orderResponse, forOrderId: forOrderId };
};

const wrapper = async function () {
  const openBuyOrders = await getOpenBuyOrders();
  // placedOrders
  // - openBuyOrders
  // console.log("open buy orders:", openBuyOrders);
  const executedBuyOrders = placedOrders.filter(function (odr) {
    const poId = odr.orderId;
    const foundMatch = openBuyOrders.find(function (openOdr) {
      return openOdr.orderId === poId;
    });

    return !foundMatch;
  });
  // console.log("executed orders:", executedBuyOrders);
  // if order already exists in executed.json, then skip
  // else place sell order and save in executed.json with forOrderId of buy order
  const placedSellOrders = JSON.parse(fs.readFileSync("executed.json"));
  const execBuyOrderWithoutSellOrders = executedBuyOrders.filter(function (
    odr
  ) {
    const eboId = odr.orderId;
    const foundMatch = placedSellOrders.find(function (sOdr) {
      return sOdr.forOrderId === eboId;
    });
    return !foundMatch;
  });
  console.log(
    "executed buy orders without sell orders:",
    execBuyOrderWithoutSellOrders
  );
  const sellOrderPromises = execBuyOrderWithoutSellOrders.map(function (odr) {
    return placeSellOrder({
      symbol: "BTCUSDT",
      quoteQty: odr.origQty * odr.price,
      price: odr.price * 1.012,
      forOrderId: odr.orderId,
    });
  });
  const sellOrderResponses = await Promise.all(sellOrderPromises);
  const allPlacedSellOrders = [
    ...JSON.parse(JSON.stringify(placedSellOrders)),
    ...JSON.parse(JSON.stringify(sellOrderResponses)),
  ];
  fs.writeFileSync("executed.json", JSON.stringify(allPlacedSellOrders));
};
wrapper();
