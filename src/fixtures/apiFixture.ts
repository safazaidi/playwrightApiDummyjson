import { test as base } from '@playwright/test';
import { CartService } from '../api/services/cartService';

type APIFixtures = {
  cartService: CartService;
};

export const test = base.extend<APIFixtures>({
  cartService: async ({ request }, use) => {
    const service = new CartService(request);

    await use(service);
  },
});

export { expect } from '@playwright/test';