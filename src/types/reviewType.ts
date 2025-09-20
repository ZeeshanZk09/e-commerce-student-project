type Review = {
  id: string,
  productId: string,
  userId: string,
  rating: number, // 1–5
  comment?: string,
  createdAt: Date,
}
