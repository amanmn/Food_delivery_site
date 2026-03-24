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
        path: "shopOrders.shop",
        select: "name"
      },
      {
        path: "shopOrders.owner",
        select: "name email"
      },
      {
        path: "shopOrders.shopOrderItems.item",
        select: "name image price"
      },
      {
        path: "shopOrders.assignedDeliveryBoy",
        select: "name phone"
      }
    ]
  }
];

module.exports = populateUser;