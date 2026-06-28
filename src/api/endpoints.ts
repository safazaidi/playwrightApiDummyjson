// src/api/endpoints.ts
export const ENDPOINTS = {
  CARTS: '/carts',
  CART_BY_ID: (id: number) => `/carts/${id}`,
  CART_ADD: '/carts/add',
  CART_UPDATE: (id: number) => `/carts/${id}`,
  CART_DELETE: (id: number) => `/carts/${id}`,
} as const;