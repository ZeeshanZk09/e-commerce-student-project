type Payment = {
  id: string,
  orderId: string,
  amount: number,
  method: "credit_card" | "debit_card" | "jazzcash" | "easypaisa" | "cod",
  status: "initiated" | "successful" | "failed" | "refunded",
  transactionId?: string,
  createdAt: Date,
}
