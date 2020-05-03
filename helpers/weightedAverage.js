const weightedAverage = function ({ list, priceKey, quantityKey }) {
  let totalAmount = 0;
  let totalQuantity = 0;
  list.forEach(function (item) {
    totalAmount += parseFloat(item[quantityKey] * item[priceKey]);
    totalQuantity += parseFloat(item[quantityKey]);
  });
  if (!isNaN(totalAmount) && !isNaN(totalQuantity) && !!totalQuantity) {
    return totalAmount / totalQuantity;
  } else {
    throw new Error(
      "Either amount or quantiti could not be converted to numbers or you're trying to divide by zero"
    );
  }
};

module.exports = weightedAverage;
