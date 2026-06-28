import { APIResponse } from '@playwright/test';
import { test, expect } from '../../src/fixtures/apiFixture';
import { ApiClient } from '../../src/utils/apiClient';
import { CartService } from '../../src/api/services/cartService';
import { HTTP_STATUS } from '../../src/constants/httpStatus';
import type { CartsResponse } from '../helpers/types';

test.describe('GET /carts', () => {

  let response: APIResponse;
  let body: CartsResponse;

  test.beforeAll(async () => {

    const apiClient = new ApiClient();

    await apiClient.init();

    const context = apiClient.getContext();

    const cartService = new CartService(context);

    response = await cartService.getAllCarts();

    body = await response.json();

  });

  test('TC-001 | Statut HTTP 200', async () => {

    expect(response.status()).toBe(HTTP_STATUS.OK);

  });
  test('TC-002 | proprieties carts exist', async () => {

    
    expect(body).toHaveProperty('carts');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('skip');
    expect(body).toHaveProperty('limit');
    

  });
  test('TC-003 | proprieties of one cart', async () => {

    const firstCart = body.carts[0]
    expect(firstCart).toHaveProperty('id')
    expect(firstCart).toHaveProperty('products')
    expect(firstCart).toHaveProperty('total')
    expect(firstCart).toHaveProperty('discountedTotal')
    expect(firstCart).toHaveProperty('userId')
    expect(firstCart).toHaveProperty('totalProducts')
    expect(firstCart).toHaveProperty('totalQuantity')


  });


});