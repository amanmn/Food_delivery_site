const populateUser = [
  {
    path: "cart",
    populate: {
      path: "items.product"
    }
  },
  {
    path: "orders",
    options: { sort: { createdAt: -1 } }, // newest first
    populate: [
      {
        path: "items.product"
      },
      {
        path: "shopOrders.shop"
      },
      {
        path: "shopOrders.owner"
      },
      {
        path: "shopOrders.shopOrderItems.item"
      }
    ]
  }
];

module.exports = populateUser;