import { APIRequestContext, request } from '@playwright/test';

export class ApiClient {

    private apiContext!: APIRequestContext;

    async init() {
        this.apiContext = await request.newContext();
    }

    getContext() {
        return this.apiContext;
    }

    async dispose() {
        await this.apiContext.dispose();
    }
}