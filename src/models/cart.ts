// src/models/cart.ts
export interface Cart {
  id: number;
  userId: number;
  products: CartProduct[];
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
}

export interface CartProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
}