import { APIRequestContext } from '@playwright/test';

export class BaseApiClient {
  constructor(protected request: APIRequestContext) {}

  async get(url: string) {
    return await this.request.get(url);
  }

  async post(url: string, body: any) {
    return await this.request.post(url, {
      data: body
    });
  }

  async put(url: string, body: any) {
    return await this.request.put(url, {
      data: body
    });
  }

  async delete(url: string) {
    return await this.request.delete(url);
  }
}