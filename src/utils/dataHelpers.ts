import fs from 'fs-extra';
import path from 'path';
import { Cart, CartProduct } from '../models';

export type CartProductPayload = {
  id: number;
  quantity: number;
};

export type CartRequestPayload = {
  userId: number;
  products: CartProductPayload[];
};

export const buildCartProduct = (
  id: number,
  quantity = 1
): CartProductPayload => ({
  id,
  quantity,
});

export const buildCartPayload = (
  userId: number,
  products: CartProductPayload[]
): CartRequestPayload => ({
  userId,
  products,
});

export const buildDefaultCartPayload = (): CartRequestPayload =>
  buildCartPayload(1, [buildCartProduct(1, 2), buildCartProduct(2, 1)]);

export const buildInvalidCartPayload = (): unknown => ({
  userId: 'invalid',
  products: [{ id: 'abc', quantity: -1 }],
});

export const loadTestData = async <T>(relativeFilePath: string): Promise<T> => {
  const filePath = path.resolve(__dirname, '../testData', relativeFilePath);
  return fs.readJSON(filePath) as Promise<T>;
};

export const isCartProduct = (value: any): value is CartProduct =>
  !!value &&
  typeof value.id === 'number' &&
  typeof value.title === 'string' &&
  typeof value.price === 'number' &&
  typeof value.quantity === 'number';

export const isCart = (value: any): value is Cart =>
  !!value &&
  typeof value.id === 'number' &&
  typeof value.userId === 'number' &&
  Array.isArray(value.products) &&
  value.products.every(isCartProduct) &&
  typeof value.total === 'number' &&
  typeof value.discountedTotal === 'number' &&
  typeof value.totalProducts === 'number' &&
  typeof value.totalQuantity === 'number';

export const normalizeCartResponse = (data: any): Cart => ({
  id: Number(data.id),
  userId: Number(data.userId),
  products: Array.isArray(data.products)
    ? data.products.map((product: any) => ({
        id: Number(product.id),
        title: String(product.title),
        price: Number(product.price),
        quantity: Number(product.quantity),
      }))
    : [],
  total: Number(data.total ?? 0),
  discountedTotal: Number(data.discountedTotal ?? 0),
  totalProducts: Number(data.totalProducts ?? 0),
  totalQuantity: Number(data.totalQuantity ?? 0),
});

export const calculateCartTotals = (
  products: Array<{ price: number; quantity: number }>
) => {
  const totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);
  const total = products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return { total, totalQuantity };
};

export const compareCartTotals = (cart: Cart) => {
  const expected = calculateCartTotals(cart.products);
  return {
    totalMatches: expected.total === cart.total,
    totalQuantityMatches: expected.totalQuantity === cart.totalQuantity,
    expectedTotal: expected.total,
    expectedQuantity: expected.totalQuantity,
  };
};