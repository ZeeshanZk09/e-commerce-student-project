type Product = {
  id: string,
  sellerId: string, // reference to User (Seller)
  name: string,
  description: string,
  categoryId: string,
  price: number,
  discount?: number,
  stock: number,
  images: string[],
  attributes?: Record<string, string>, // size, color, etc.
  status: "active" | "inactive",
  createdAt: Date,
  updatedAt: Date,
}
