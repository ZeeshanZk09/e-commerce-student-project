type Category = {
  id: string,
  name: string,
  description?: string,
  parentId?: string, // for subcategories
  createdAt: Date,
  updatedAt: Date,
}
