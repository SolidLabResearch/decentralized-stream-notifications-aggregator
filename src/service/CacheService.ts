import { Redis } from "ioredis";
import { RedisStatus } from "../utils/Types";
/**
 * A service for interacting with the Redis cache.
 * @class CacheService
 */
export class CacheService {
    public client: any;
    /**
     * Creates an instance of CacheService.
     * @memberof CacheService
     */
    constructor() {
        // defaults to localhost:6379 if no options are provided, which is the default for Redis.
        this.client = new Redis({});
        this.setupListeners();
    }
    /**
     * Connects to the Redis cache.
     * @returns {Promise<boolean>} - A promise that resolves to true if the connection is successful.
     * @memberof CacheService
     */
    async connect() {
        await this.client.connect();
        return true;

    }

    /**
     * Sets up the listeners for the Redis client.
     * @private
     * @memberof CacheService
     */
    private setupListeners() {
        this.client.on("connect", () => {
            return true;
        });

        this.client.on("error", (error: any) => {
            console.log(`Error: ${error}`);
            return false;
        });
    }

    /**
     * Sets a value in the Redis cache.
     * @param {string} key - The key to set.
     * @param {any} value - The value to set.
     * @returns {Promise<void>} - A promise that resolves when the value is set.
     * @memberof CacheService
     */
    async set(key: any, value: any) {
        await this.client.set(key, value);
    }
    /**
     * Gets a value from the Redis cache.
     * @param {string} key - The key to get.
     * @returns {Promise<any>} - The value of the key in the cache returned as a promise.
     * @memberof CacheService
     */
    async get(key: string) {
        return await this.client.get(key);
    }
    /**
     * Disconnects from the Redis cache.
     * @returns {Promise<void>}
     * @memberof CacheService
     */
    async disconnect() {
        await this.client.quit();
        return true;
    }

    /**
     * Deletes a key from the Redis cache.
     * @param {string} key - The key to delete.
     * @returns {Promise<void>}
     * @memberof CacheService
     */
    async delete(key: string) {
        await this.client.del(key);
    }
    /**
     * Get the status of the Redis cache.
     * @returns {Promise<RedisStatus>} - The current status of the Redis Cache, returned as a promise.
     * @memberof CacheService
     */
    async get_status(): Promise<RedisStatus> {
        return await this.client.status;
    }
}

