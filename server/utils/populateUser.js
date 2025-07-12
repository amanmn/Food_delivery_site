// utils/populateUser.js (optional helper file if you want)
const populateUser = [
  { path: "cart", populate: { path: "items.product" } },
  { path: "orders", populate: { path: "items.product" } },
];

module.exports = populateUser;
