import { createClient } from "redis";

export class CacheService {
    private client: any;
    constructor() {
        this.client = createClient({});
        this.setupListeners();
    }

    async connect() {
        await this.client.connect();
        return true;

    }

    private setupListeners() {
        this.client.on("connect", () => {
            return true;
        });

        this.client.on("error", (error: any) => {
            console.log(`Error: ${error}`);
            return false;
        });
    }

    async set(key: any, value: any) {
        await this.client.set(key, value);
    }

    async get(key: any) {
        return await this.client.get(key);
    }

    async disconnect() {
        await this.client.quit();
    }

    async delete(key: any) {
        await this.client.del(key);
    }
}

