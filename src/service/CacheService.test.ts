import { CacheService } from './CacheService';

describe('CacheService', () => {
    let cacheService: CacheService;

    beforeEach(() => {
        cacheService = new CacheService();
    });

    afterEach(async () => {
        await cacheService.disconnect();
    });

    it('should_set_and_get_a_value', async () => {
        await cacheService.set('key', 'value');
        const value = await cacheService.get('key');
        expect(value).toBe('value');
    });

    it('should_delete_a_value', async () => {
        await cacheService.set('key', 'value');
        await cacheService.delete('key');
        const value = await cacheService.get('key');
        expect(value).toBe(null);
    });

    it('should_close_the_connection', async () => {
        const is_disconnected = await cacheService.disconnect();
        expect(is_disconnected).toBe(true);
    });

    it('should_describe_the_cache', async () => {
        const status = await cacheService.get_status();
        expect(status).toBe('wait');
    });

    it('test_number_of_runs', async () => {
        await cacheService.set('key', 'value');
        for (let i = 0; i < 10000; i++) {
            console.log(await cacheService.get('key'));
        }
    });
}); 