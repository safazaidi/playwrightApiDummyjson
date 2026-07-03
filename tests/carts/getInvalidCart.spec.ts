import { APIResponse } from '@playwright/test';
import { test, expect } from '../../src/fixtures/apiFixture';
import { ApiClient } from '../../src/utils/apiClient';
import { CartService } from '../../src/api/services/cartService';
import { HTTP_STATUS } from '../../src/constants/httpStatus';
import type { ApiError } from '../helpers/types';

test.describe('GET Invalid Cart',()=>{
    let response: APIResponse;
    let body: ApiError;
    test.beforeAll(async () => {

    const apiClient = new ApiClient();

    await apiClient.init();

    const context = apiClient.getContext();

    const cartService = new CartService(context);

    response = await cartService.getCartById(999);

    body = await response.json();

  });

  test('TC-001 | ID=1 — Statut 404', async () => {
    expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND)

  })

  test('TC-002',async () =>{
     body = await response.json();

    expect(body.message).toContain('not found');

  })
})