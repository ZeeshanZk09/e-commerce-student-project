type Cart = {
  id: string,
  userId: string,
  items: {
    productId: string,
    sellerId: string,
    quantity: number,
  }[],
  updatedAt: Date,
}
