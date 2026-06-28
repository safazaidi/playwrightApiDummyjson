// src/api/services/cartService.ts
// CartService.ts
import { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from '../../../src/api/clients/baseApiClient';
import { Cart } from '../../../src/models/cart';

// 1. Extend the Base Client
export class CartService extends BaseApiClient {
  private readonly endpoint = '/carts'; // Centralized endpoint base

  constructor(request: APIRequestContext) {
    super(request); // Pass context up to the BaseApiClient
  }

  async getAllCarts() {
    return await this.get(this.endpoint); 
  }

  async getCartById(id: number) {
    return await this.get(`${this.endpoint}/${id}`);
  }

  async createCart(data: Partial<Cart>) {
    return await this.post(this.endpoint, data);
  }

  async updateCart(id: number, data: Partial<Cart>) {
    return await this.put(`${this.endpoint}/${id}`, data);
  }

  async deleteCart(id: number) {
    return await this.delete(`${this.endpoint}/${id}`);
  }
}