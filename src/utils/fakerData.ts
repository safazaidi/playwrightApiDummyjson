/**
 * Faker utilities for generating realistic test data for Cart API tests
 * Works with optional @faker-js/faker or provides fallback random generation
 */

import { CartProduct, Cart } from '../models/cart';

// Try to use @faker-js/faker if available, otherwise use lightweight fallback
let faker: any = null;
try {
  faker = require('@faker-js/faker').faker;
} catch {
  // Fallback: lightweight random generators
  faker = null;
}

/**
 * Fallback random generators (no external dependency)
 */
const fallbackRandom = {
  integer: (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
  float: (min: number, max: number, decimals = 2) =>
    Number((Math.random() * (max - min) + min).toFixed(decimals)),
  word: () =>
    ['electronics', 'furniture', 'clothing', 'books', 'toys'][
      Math.floor(Math.random() * 5)
    ],
  productName: () => {
    const adjectives = ['Premium', 'Deluxe', 'Classic', 'Ultra', 'Pro'];
    const nouns = ['Monitor', 'Keyboard', 'Mouse', 'Headset', 'Desk', 'Chair'];
    return (
      adjectives[Math.floor(Math.random() * adjectives.length)] +
      ' ' +
      nouns[Math.floor(Math.random() * nouns.length)]
    );
  },
  email: () =>
    `user${Math.random().toString(36).substring(7)}@example.com`,
};

/**
 * Generate random product ID (1-194 typical for DummyJSON)
 */
export const generateProductId = (): number => {
  if (faker) {
    return faker.datatype.number({ min: 1, max: 194 });
  }
  return fallbackRandom.integer(1, 194);
};

/**
 * Generate random product title
 */
export const generateProductTitle = (): string => {
  if (faker) {
    return `${faker.commerce.productAdjective()} ${faker.commerce.product()}`;
  }
  return fallbackRandom.productName();
};

/**
 * Generate random realistic product price ($5 - $500)
 */
export const generateProductPrice = (): number => {
  if (faker) {
    return Number(faker.commerce.price({ min: 5, max: 500, dec: 2 }));
  }
  return fallbackRandom.float(5, 500, 2);
};

/**
 * Generate random quantity (1-10)
 */
export const generateQuantity = (min = 1, max = 10): number => {
  if (faker) {
    return faker.datatype.number({ min, max });
  }
  return fallbackRandom.integer(min, max);
};

/**
 * Generate random user ID (1-50 typical for DummyJSON)
 */
export const generateUserId = (): number => {
  if (faker) {
    return faker.datatype.number({ min: 1, max: 50 });
  }
  return fallbackRandom.integer(1, 50);
};

/**
 * Generate random cart ID (1-20 typical for DummyJSON)
 */
export const generateCartId = (): number => {
  if (faker) {
    return faker.datatype.number({ min: 1, max: 20 });
  }
  return fallbackRandom.integer(1, 20);
};

/**
 * Generate a single fake CartProduct
 */
export const generateCartProduct = (
  override?: Partial<CartProduct>
): CartProduct => ({
  id: generateProductId(),
  title: generateProductTitle(),
  price: generateProductPrice(),
  quantity: generateQuantity(1, 5),
  ...override,
});

/**
 * Generate multiple fake CartProducts
 */
export const generateCartProducts = (count = 3): CartProduct[] => {
  return Array.from({ length: count }, () => generateCartProduct());
};

/**
 * Generate a fake Cart (without totals, as API calculates those)
 */
export const generateCart = (
  override?: Partial<Cart>
): Omit<Cart, 'total' | 'discountedTotal'> & Partial<Cart> => {
  const products = generateCartProducts(generateQuantity(1, 5));

  return {
    id: generateCartId(),
    userId: generateUserId(),
    products,
    totalProducts: products.length,
    totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
    total: 0,
    discountedTotal: 0,
    ...override,
  };
};

/**
 * Generate bulk test data for performance testing
 */
export const generateBulkCarts = (
  count: number
): Array<Omit<Cart, 'total' | 'discountedTotal'> & Partial<Cart>> => {
  return Array.from({ length: count }, () => generateCart());
};

/**
 * Generate cart payload with edge-case values
 */
export const generateEdgeCaseCart = (
  caseType: 'minimal' | 'maximal' | 'zero-quantity'
): Partial<Cart> => {
  switch (caseType) {
    case 'minimal':
      return {
        userId: 1,
        products: [
          {
            id: 1,
            title: 'Single Item',
            price: 0.01,
            quantity: 1,
          },
        ],
      };
    case 'maximal':
      return {
        userId: 99999,
        products: Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          title: `Product ${i + 1}`,
          price: 9999.99,
          quantity: 100,
        })),
      };
    case 'zero-quantity':
      return {
        userId: generateUserId(),
        products: [
          {
            id: generateProductId(),
            title: generateProductTitle(),
            price: generateProductPrice(),
            quantity: 0,
          },
        ],
      };
    default:
      return generateCart();
  }
};

/**
 * Generate random email for user-related operations
 */
export const generateEmail = (): string => {
  if (faker) {
    return faker.internet.email();
  }
  return fallbackRandom.email();
};

/**
 * Generate seed/reproducible data using a seed value
 */
export const generateCartWithSeed = (seed: number): CartProduct => {
  const seededRandom = (index: number) => {
    return Math.sin(seed + index) * 10000 - Math.floor(Math.sin(seed + index) * 10000);
  };

  return {
    id: Math.floor(seededRandom(1) * 194) + 1,
    title: `Seeded Product ${seed}`,
    price: Math.floor(seededRandom(2) * 500) + 5,
    quantity: Math.floor(seededRandom(3) * 10) + 1,
  };
};