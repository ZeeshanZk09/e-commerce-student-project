type Order = {
  id: string,
  customerId: string, // reference to User
  items: {
    productId: string,
    sellerId: string,
    quantity: number,
    price: number,
  }[],
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned",
  paymentStatus: "unpaid" | "paid" | "refunded",
  shippingAddress: Address,
  trackingNumber?: string,
  createdAt: Date,
  updatedAt: Date,
}
