import { Readable } from "stream"
import { CacheService } from "../service/CacheService";
const cache_service = new CacheService();
/**
 * Fetches the members from the cache service between the specified dates.
 * @param {{
 *     from?: Date,
 *     until?: Date,
 * }} [opts] - The options for the fetch.
 * @param {Date} [opts.from] - The start date.
 * @param {Date} [opts.until] - The end date.
 * @returns {Promise<Readable>} - A promise that resolves to a readable stream of the members.
 */
export async function getMembers(opts?: {
    from?: Date,
    until?: Date,
}): Promise<Readable> {
    opts = opts ?? {};
    const from = opts.from ?? new Date(0);
    const until = opts.until ?? new Date();
    const from_epoch = from.getTime();
    const until_epoch = until.getTime();
    const member_stream = new Readable({
        objectMode: true,
        read() {

        }
    });
    const database = await cache_service.read_whole_database();
    for (const key in database) {
        const value = database[key];
        const timestamp = parseInt(key);
        if (timestamp >= from_epoch && timestamp <= until_epoch) {
            member_stream.push(value);
        }
    }
    return member_stream;
}
