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
    /**
     * Get all key-value pairs from the Redis cache.
     * This method is not recommended for large databases, as it will load all key-value pairs into memory and be slow.
     * However, it is useful for notification caching, where the database is expected to be small to get the missing notifications.
     * @returns {Promise<{ [key: string]: string }>} - A promise that resolves to an object containing all key-value pairs in the cache.
     * @memberof CacheService
     */
    async read_whole_database(): Promise<{ [key: string]: string }> {
        let cursor = '0';
        const key_values: { [key: string]: string } = {};
        do {
            const [newCursor, keys] = await this.client.scan(cursor);
            cursor = newCursor;

            if (keys.length > 0) {
                const values = await this.client.mget(...keys);
                keys.forEach((key: any, index: any) => {
                    const value = values[index];
                    if (value !== null) {
                        key_values[key] = value;
                    } else {
                        console.warn(`Key '${key}' does not exist.`);
                    }
                });
            }
        } while (cursor !== '0');
        return key_values
    }


    /**
     * Get the most recent key-value pair from the Redis cache.
     * @param {string} ldes_stream - The LDES stream to get the most recent key-value pair from.    
     * @returns {Promise<{ key: string, value: string }>} - A promise that resolves to an object containing the most recent key-value pair in the cache.
     */
    async get_recent_key_value(ldes_stream: string): Promise<{ key: string, value: string }> {
        try {
            // example of a key is, stream:http://localhost:3000/aggregation_pod/aggregation/:1710250027636
            const pattern = `stream:${ldes_stream}:*`;
            const keys = await this.client.scan(0, "MATCH", pattern);

            const sortedKeys = keys[1].sort((a: string, b: string) => {
                const a_timestamp = parseInt(a.split(":")[1]);
                const b_timestamp = parseInt(b.split(":")[1]);
                return b_timestamp - a_timestamp;
            });

            console.log(sortedKeys);

            const most_recent_key = sortedKeys[sortedKeys.length - 1];
            const value = await this.client.get(most_recent_key);

            return { key: most_recent_key, value: value };
        } finally {
            await this.client.quit();
        }
    }
    
    

    /**
     * Sets the time to live for a key in the Redis cache.
     * @param {string} key - The key to set the time to live for.
     * @param {number} time_to_live - The time to live in seconds.
     * @returns {Promise<void>} - A promise that resolves when the time to live is set.
     */
    async setTimeToLive(key: string, time_to_live: number) {
        // setting the time to live for the key in seconds.
        await this.client.expire(key, time_to_live);
    }

    /**
     * Clears the cache.
     */
    async clearCache() {
        await this.client.flushall();
    }

}

