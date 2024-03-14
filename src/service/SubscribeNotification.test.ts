// import { SubscribeNotification } from './SubscribeNotification';
// import { extract_ldp_inbox, extract_subscription_server } from '../utils/Util';

// jest.mock('../utils/Util', () => ({
//   extract_ldp_inbox: jest.fn(),
//   extract_subscription_server: jest.fn(),
// }));

// describe('SubscribeNotification', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should subscribe successfully', async () => {
//     const streams = ['stream1', 'stream2'];
//     const subscribeNotification = new SubscribeNotification(streams);

//     (extract_ldp_inbox as jest.Mock).mockResolvedValueOnce('inbox1');
//     (extract_subscription_server as jest.Mock).mockResolvedValueOnce({
//       location: 'http://subscription-server1',
//     });

//     const fetchMock = jest.fn().mockResolvedValueOnce({ status: 200 });
//     global.fetch = fetchMock;

//     const result = await subscribeNotification.subscribe();

//     expect(result).toBe(true);
//     expect(extract_ldp_inbox).toHaveBeenCalledWith('stream1');
//     expect(extract_subscription_server).toHaveBeenCalledWith('inbox1');
//     expect(fetchMock).toHaveBeenCalledWith('http://subscription-server1', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/ld+json',
//       },
//       body: JSON.stringify({
//         '@context': ['https://www.w3.org/ns/solid/notification/v1'],
//         type: 'http://www.w3.org/ns/solid/notifications#WebhookChannel2023',
//         topic: 'inbox1',
//         sendTo: 'http://localhost:8085/',
//       }),
//     });
//   });

//   it('should throw an error if subscription server is undefined', async () => {
//     const streams = ['stream1'];
//     const subscribeNotification = new SubscribeNotification(streams);

//     (extract_ldp_inbox as jest.Mock).mockResolvedValueOnce('inbox1');
//     (extract_subscription_server as jest.Mock).mockResolvedValueOnce(undefined);

//     await expect(subscribeNotification.subscribe()).rejects.toThrow(
//       'Subscription server is undefined.'
//     );

//     expect(extract_ldp_inbox).toHaveBeenCalledWith('stream1');
//     expect(extract_subscription_server).toHaveBeenCalledWith('inbox1');
//   });

//   it('should throw an error if subscription to the notification server fails', async () => {
//     const streams = ['stream1'];
//     const subscribeNotification = new SubscribeNotification(streams);

//     (extract_ldp_inbox as jest.Mock).mockResolvedValueOnce('inbox1');
//     (extract_subscription_server as jest.Mock).mockResolvedValueOnce({
//       location: 'http://subscription-server1',
//     });

//     const fetchMock = jest.fn().mockResolvedValueOnce({ status: 500 });
//     global.fetch = fetchMock;

//     await expect(subscribeNotification.subscribe()).rejects.toThrow(
//       'The subscription to the notification server failed.'
//     );

//     expect(extract_ldp_inbox).toHaveBeenCalledWith('stream1');
//     expect(extract_subscription_server).toHaveBeenCalledWith('inbox1');
//     expect(fetchMock).toHaveBeenCalledWith('http://subscription-server1', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/ld+json',
//       },
//       body: JSON.stringify({
//         '@context': ['https://www.w3.org/ns/solid/notification/v1'],
//         type: 'http://www.w3.org/ns/solid/notifications#WebhookChannel2023',
//         topic: 'inbox1',
//         sendTo: 'http://localhost:8085/',
//       }),
//     });
//   });
// });
