import { getMembers } from './FetchUtil'; // Assuming the module file is named 'yourModule.js'
import { Readable } from 'stream';

describe('getMembers function', () => {
    it('should return a readable stream of members within the specified date range', async () => {
        // Mocking CacheService
        const mockDatabase = {
            '1646822400000': 'Member 1', // March 9, 2022
            '1646908800000': 'Member 2', // March 10, 2022
            '1646995200000': 'Member 3', // March 11, 2022
            '1647081600000': 'Member 4', // March 12, 2022
        };
        const mockCacheService = {
            read_whole_database: jest.fn().mockResolvedValue(mockDatabase)
        };
        jest.mock('../service/CacheService', () => ({
            CacheService: jest.fn(() => mockCacheService)
        }));

        // Test parameters
        const from = new Date('2022-03-10T00:00:00Z');
        const until = new Date('2022-03-12T23:59:59Z');

        // Call the function
        const result = await getMembers({ from, until });

        // Validate result
        expect(result instanceof Readable).toBe(true);

        // Read stream and validate members
        const members: any[] = [];
        result.on('data', data => members.push(data));
        result.on('end', () => {
            expect(members).toHaveLength(3);
            expect(members).toContain('Member 2');
            expect(members).toContain('Member 3');
            expect(members).toContain('Member 4');
        });
    });

    it('should return an empty stream if no members found within the specified date range', async () => {
        // Mocking CacheService
        const mockDatabase = {
            '1646822400000': 'Member 1', // March 9, 2022
            '1646908800000': 'Member 2', // March 10, 2022
            '1646995200000': 'Member 3', // March 11, 2022
            '1647081600000': 'Member 4', // March 12, 2022
        };
        const mockCacheService = {
            read_whole_database: jest.fn().mockResolvedValue(mockDatabase)
        };
        jest.mock('../service/CacheService', () => ({
            CacheService: jest.fn(() => mockCacheService)
        }));

        // Test parameters
        const from = new Date('2022-03-13T00:00:00Z');
        const until = new Date('2022-03-14T23:59:59Z');

        // Call the function
        const result = await getMembers({ from, until });

        // Validate result
        expect(result instanceof Readable).toBe(true);

        // Read stream and validate members
        const members: any[] = [];
        result.on('data', data => members.push(data));
        result.on('end', () => {
            expect(members).toHaveLength(0);
        });
    });
});
