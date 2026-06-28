// =============================================================================
// helpers/types.ts
// DummyJSON /carts — Type definitions, type guards, factories & assertion helpers
// Used by Playwright API test suites (*.spec.ts)
// =============================================================================

// ---------------------------------------------------------------------------
// 1. CORE INTERFACES
// ---------------------------------------------------------------------------

/**
 * A single product line inside a cart.
 * Mirrors the shape returned by GET /carts, GET /carts/:id, POST /carts/add,
 * PUT /carts/:id and PATCH /carts/:id.
 */
export interface CartProduct {
  /** DummyJSON product id (> 0) */
  id: number;
  /** Human-readable product name */
  title: string;
  /** Unit price in USD (> 0) */
  price: number;
  /** Number of units in the cart (integer > 0) */
  quantity: number;
  /** price × quantity (may carry floating-point drift) */
  total: number;
  /** Discount rate applied to this product line [0 – 100] */
  discountPercentage: number;
  /** total after discount has been applied (≤ total) */
  discountedTotal: number;
  /** Absolute URL of the product thumbnail image */
  thumbnail: string;
}

/**
 * A shopping cart belonging to one user.
 * Returned by GET /carts, GET /carts/:id, GET /carts/user/:userId,
 * POST /carts/add, PUT /carts/:id, PATCH /carts/:id and DELETE /carts/:id.
 */
export interface Carts {
  /** Unique cart identifier (> 0) */
  id: number;
  /** Ordered list of product lines in this cart */
  products: CartProduct[];
  /** Sum of all product line totals (before discount) */
  total: number;
  /** Sum of all product line discountedTotals (≤ total) */
  discountedTotal: number;
  /** ID of the user who owns this cart */
  userId: number;
  /** Number of distinct product lines — equals products.length */
  totalProducts: number;
  /** Sum of all product quantities across every line */
  totalQuantity: number;
}

/**
 * Paginated envelope returned by GET /carts and GET /carts/user/:userId.
 */
export interface CartsResponse {
  /** Page of carts for the current skip/limit window */
  carts: Carts[];
  /** Total number of carts in the data store (independent of pagination) */
  total: number;
  /** Number of records skipped (offset). Defaults to 0. */
  skip: number;
  /** Maximum number of records per page. Defaults to 30. */
  limit: number;
}

// ---------------------------------------------------------------------------
// 2. MUTATION PAYLOAD TYPES  (POST / PUT / PATCH)
// ---------------------------------------------------------------------------

/**
 * Minimal product descriptor accepted by write endpoints.
 * Only id and quantity are required — the API resolves the rest.
 */
export interface CartProductInput {
  id: number;
  quantity: number;
}

/** Payload for POST /carts/add */
export interface AddCartPayload {
  userId: number;
  products: CartProductInput[];
}

/**
 * Payload for PUT /carts/:id (full replacement)
 * and PATCH /carts/:id (partial update).
 *
 * @param merge  When true the API merges products with existing ones.
 *               When false (default) existing products are replaced.
 */
export interface UpdateCartPayload {
  merge?: boolean;
  products: CartProductInput[];
}

// ---------------------------------------------------------------------------
// 3. DELETE RESPONSE TYPE
// ---------------------------------------------------------------------------

/**
 * Extended Cart returned by DELETE /carts/:id.
 * The API keeps all cart fields and appends deletion metadata.
 */
export interface DeletedCart extends Carts {
  /** Always true when the deletion succeeded */
  isDeleted: boolean;
  /** ISO-8601 timestamp of when the record was (logically) deleted */
  deletedOn: string;
}

// ---------------------------------------------------------------------------
// 4. ERROR RESPONSE TYPE
// ---------------------------------------------------------------------------

/**
 * Shape of 4xx error bodies returned by DummyJSON.
 * Example: GET /carts/9999 → { message: "Cart with id '9999' not found" }
 */
export interface ApiError {
  message: string;
}

// ---------------------------------------------------------------------------
// 5. TYPE GUARDS
// ---------------------------------------------------------------------------

/**
 * Narrows an unknown value to {@link CartProduct}.
 * Use in test assertions to get full type inference after validation.
 *
 * @example
 * const body = await res.json();
 * expect(isCartProduct(body.products[0])).toBe(true);
 */
export function isCartProduct(value: unknown): value is CartProduct {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p['id'] === 'number' &&
    typeof p['title'] === 'string' &&
    typeof p['price'] === 'number' &&
    typeof p['quantity'] === 'number' &&
    typeof p['total'] === 'number' &&
    typeof p['discountPercentage'] === 'number' &&
    typeof p['discountedTotal'] === 'number' &&
    typeof p['thumbnail'] === 'string'
  );
}

/**
 * Narrows an unknown value to {@link Cart}.
 *
 * @example
 * const body = await res.json();
 * if (isCart(body)) { // body is now Cart
 *   expect(body.userId).toBeGreaterThan(0);
 * }
 */
export function isCart(value: unknown): value is Carts {
  if (typeof value !== 'object' || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c['id'] === 'number' &&
    Array.isArray(c['products']) &&
    (c['products'] as unknown[]).every(isCartProduct) &&
    typeof c['total'] === 'number' &&
    typeof c['discountedTotal'] === 'number' &&
    typeof c['userId'] === 'number' &&
    typeof c['totalProducts'] === 'number' &&
    typeof c['totalQuantity'] === 'number'
  );
}

/**
 * Narrows an unknown value to {@link CartsResponse}.
 */
export function isCartsResponse(value: unknown): value is CartsResponse {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    Array.isArray(r['carts']) &&
    (r['carts'] as unknown[]).every(isCart) &&
    typeof r['total'] === 'number' &&
    typeof r['skip'] === 'number' &&
    typeof r['limit'] === 'number'
  );
}

/**
 * Narrows an unknown value to {@link DeletedCart}.
 */
export function isDeletedCart(value: unknown): value is DeletedCart {
  if (!isCart(value)) return false;
  const d = value as unknown as Record<string, unknown>;
  return (
    d['isDeleted'] === true &&
    typeof d['deletedOn'] === 'string' &&
    !isNaN(Date.parse(d['deletedOn'] as string))
  );
}

/**
 * Narrows an unknown value to {@link ApiError}.
 */
export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) return false;
  const e = value as Record<string, unknown>;
  return typeof e['message'] === 'string' && e['message'].length > 0;
}

// ---------------------------------------------------------------------------
// 6. ASSERTION HELPERS  (pure functions — no Playwright dependency)
// ---------------------------------------------------------------------------

/**
 * Returns true when `discountedTotal` is within `tolerance` of the
 * expected value: `total × (1 - discountPercentage / 100)`.
 * Useful to cross-check individual product line math.
 */
export function productDiscountIsCoherent(
  product: CartProduct,
  tolerance = 0.10,
): boolean {
  const expected = product.total * (1 - product.discountPercentage / 100);
  return Math.abs(product.discountedTotal - expected) <= tolerance;
}

/**
 * Returns true when `product.total` is within `tolerance` of `price × quantity`.
 * Accounts for legitimate floating-point drift in the API.
 */
export function productTotalIsCoherent(
  product: CartProduct,
  tolerance = 0.05,
): boolean {
  const expected = product.price * product.quantity;
  return Math.abs(product.total - expected) <= tolerance;
}

/**
 * Returns true when the cart-level `total` equals (within tolerance)
 * the sum of all product line totals.
 */
export function cartTotalIsCoherent(cart: Carts, tolerance = 0.10): boolean {
  const sum = cart.products.reduce((acc, p) => acc + p.total, 0);
  return Math.abs(cart.total - sum) <= tolerance;
}

/**
 * Returns true when `totalQuantity` exactly equals the sum of quantities.
 */
export function cartQuantityIsCoherent(cart: Carts): boolean {
  const sum = cart.products.reduce((acc, p) => acc + p.quantity, 0);
  return cart.totalQuantity === sum;
}

/**
 * Returns true when `totalProducts` equals the number of product lines.
 */
export function cartProductCountIsCoherent(cart: Carts): boolean {
  return cart.totalProducts === cart.products.length;
}

// ---------------------------------------------------------------------------
// 7. TEST FACTORIES  (produce minimal valid payloads for write tests)
// ---------------------------------------------------------------------------

/**
 * Returns a minimal valid {@link AddCartPayload} for POST /carts/add.
 * Override any field with the spread operator.
 *
 * @example
 * const payload = makeAddCartPayload({ userId: 42 });
 */
export function makeAddCartPayload(
  overrides: Partial<AddCartPayload> = {},
): AddCartPayload {
  return {
    userId: 1,
    products: [
      { id: 144, quantity: 2 },
      { id: 91,  quantity: 1 },
    ],
    ...overrides,
  };
}

/**
 * Returns a minimal valid {@link UpdateCartPayload} for PUT or PATCH /carts/:id.
 *
 * @example
 * const payload = makeUpdateCartPayload({ merge: true });
 */
export function makeUpdateCartPayload(
  overrides: Partial<UpdateCartPayload> = {},
): UpdateCartPayload {
  return {
    merge: false,
    products: [{ id: 1, quantity: 1 }],
    ...overrides,
  };
}