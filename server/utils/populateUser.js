const populateUser = [
  { path: "cart", populate: { path: "items.product", model: "Item" } },
  { path: "orders", populate: { path: "items.product", model: "Item" } },
];

module.exports = populateUser;
