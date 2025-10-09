type AdminAction = {
  id: string,
  adminId: string,
  actionType: "ban_seller" | "approve_product" | "refund_order" | "update_policy",
  targetId?: string, // userId, productId, etc.
  notes?: string,
  createdAt: Date,
}
