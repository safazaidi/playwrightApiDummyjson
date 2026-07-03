import { APIResponse } from '@playwright/test';
import { test, expect } from '../../src/fixtures/apiFixture';
import { ApiClient } from '../../src/utils/apiClient';
import { CartService } from '../../src/api/services/cartService';
import { HTTP_STATUS } from '../../src/constants/httpStatus';
import type { CartsResponse } from '../helpers/types';
import type {Cart} from '../../src/models/cart'

test.describe('GET/Cart By Id' ,() =>{
     let response: APIResponse;
     let body: Cart;
     test.beforeAll(async () =>{
        const apiClent = new ApiClient();
        await apiClent.init();
        const context = apiClent.getContext();
        const cartService = new CartService(context);
        response = await cartService.getCartById(1);
        body = await response.json()

     })

    test('TC-101 | ID=1 — Statut 200', async ()=>{
        expect(response.status()).toBe(HTTP_STATUS.OK)

    })
    
    test('TC-103 | ID=1 — contient au moins un produit', async ()=>{
        
        expect(body.totalProducts).toBeGreaterThan(0)

    })
    test('TC-104 | ID=1 — userId est un entier positif', async()=>{
        expect(body.userId).toBeGreaterThan(0);
        expect(body.userId).toBe(1);
        expect(Number.isInteger(body.userId)).toBeTruthy();
        


    })




})