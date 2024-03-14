import { SubscribeNotification } from './SubscribeNotification';
import { extract_ldp_inbox, extract_subscription_server } from '../utils/Util';

jest.mock('../utils/Util', () => ({
    extract_ldp_inbox: jest.fn(),
    extract_subscription_server: jest.fn()
}));

describe('SubscribeNotification', () => {
    describe('subscribe method', () => {
        it('should subscribe to the notification server successfully', async () => {
            // Mocking dependencies
            const ldes_stream = 'example_ldes_stream';
            const inbox = 'example_inbox';
            const subscriptionServer = { location: 'example_location' };
            (extract_ldp_inbox as jest.Mock).mockResolvedValue(inbox);
            (extract_subscription_server as jest.Mock).mockResolvedValue(subscriptionServer);

            // Mocking fetch
            global.fetch = jest.fn().mockResolvedValue({ status: 200 });

            const subscribeNotification = new SubscribeNotification();
            const result = await subscribeNotification.subscribe(ldes_stream);

            expect(result).toBe(true);
            expect(extract_ldp_inbox).toHaveBeenCalledWith(ldes_stream);
            expect(extract_subscription_server).toHaveBeenCalledWith(inbox);
            expect(fetch).toHaveBeenCalledWith(subscriptionServer.location, expect.any(Object));
        });

        it('should throw an error if subscription server is undefined', async () => {
            // Mocking dependencies
            const ldes_stream = 'example_ldes_stream';
            (extract_ldp_inbox as jest.Mock).mockResolvedValue('example_inbox');
            (extract_subscription_server as jest.Mock).mockResolvedValue(undefined);

            const subscribeNotification = new SubscribeNotification();

            await expect(subscribeNotification.subscribe(ldes_stream)).rejects.toThrowError('Subscription server is undefined.');
            expect(extract_ldp_inbox).toHaveBeenCalledWith(ldes_stream);
            expect(extract_subscription_server).toHaveBeenCalledWith('example_inbox');
        });

        it('should throw an error if subscription to the notification server fails', async () => {
            // Mocking dependencies
            const ldes_stream = 'example_ldes_stream';
            const inbox = 'example_inbox';
            const subscriptionServer = { location: 'example_location' };
            (extract_ldp_inbox as jest.Mock).mockResolvedValue(inbox);
            (extract_subscription_server as jest.Mock).mockResolvedValue(subscriptionServer);

            // Mocking fetch
            global.fetch = jest.fn().mockResolvedValue({ status: 400 });

            const subscribeNotification = new SubscribeNotification();

            await expect(subscribeNotification.subscribe(ldes_stream)).rejects.toThrowError('The subscription to the notification server failed.');
            expect(extract_ldp_inbox).toHaveBeenCalledWith(ldes_stream);
            expect(extract_subscription_server).toHaveBeenCalledWith(inbox);
            expect(fetch).toHaveBeenCalledWith(subscriptionServer.location, expect.any(Object));
        });
    });
});
