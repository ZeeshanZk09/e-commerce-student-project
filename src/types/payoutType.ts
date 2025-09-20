type Payout = {
  id: string,
  sellerId: string,
  orderId: string,
  totalAmount: number,
  commission: number,
  netAmount: number,
  status: "pending" | "paid",
  createdAt: Date,
}
