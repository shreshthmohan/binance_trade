const expOrder = function ({
  amount,
  startAmount,
  priceHigh,
  priceLow,
  rate,
  includeLastOdd,
}) {
  const orderAmounts = [];
  let remainingAmount = amount;
  let orderAmount = startAmount;
  while (remainingAmount > 0) {
    if (remainingAmount > orderAmount) {
      orderAmounts.push(orderAmount);
    } else {
      orderAmounts.push(remainingAmount);
    }

    remainingAmount = remainingAmount - orderAmount;
    orderAmount = orderAmount * (1 + rate / 100);
  }
  const orderCount = orderAmounts.length;

  const interval = (priceHigh - priceLow) / (orderCount - 1);
  const orderPrices = [];
  let orderPrice = priceHigh;
  for (let i = 0; i < orderCount; i++) {
    orderPrices.push(orderPrice);
    orderPrice -= interval;
  }

  const orders = orderAmounts.map(function (oa, index) {
    return {
      amount: oa,
      price: orderPrices[index],
    };
  });
  // If the last order is smaller than the second-last order, remove it
  const orderLength = orders.length;
  if (orderLength > 2 && !includeLastOdd) {
    if (orders[orderLength - 1].amount < orders[orderLength - 2].amount) {
      return orders.slice(0, orderLength - 1);
    }
  }

  return orders;
};

module.exports = expOrder;
