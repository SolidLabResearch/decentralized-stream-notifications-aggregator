// import { WebSocketServerHandler } from './WebSocketServerHandler';

// describe('WebSocketServerHandler', () => {
//   let websocketServerHandler: WebSocketServerHandler;

//   beforeEach(() => {
//     // Create a mock WebSocket server
//     const websocketServerMock: any = {
//       on: jest.fn(),
//     };

//     websocketServerHandler = new WebSocketServerHandler(websocketServerMock);
//   });

//   it('should handle communication for the WebSocket server', async () => {
//     // Mock WebSocket server events
//     const connectCallback = websocketServerHandler.websocket_server.on.mock.calls[0][1];
//     const requestCallback = websocketServerHandler.websocket_server.on.mock.calls[1][1];

//     // Mock WebSocket connection and message events
//     const connectionMock: any = {
//       on: jest.fn(),
//     };
//     const messageMock: any = {
//       type: 'utf8',
//       utf8Data: JSON.stringify({ subscribe: ['stream1', 'stream2'] }),
//     };

//     // Call the handle_communication method
//     await websocketServerHandler.handle_communication();

//     // Simulate WebSocket server events
//     connectCallback();
//     requestCallback({ accept: () => connectionMock });

//     // Simulate WebSocket connection message event
//     connectionMock.on.mock.calls[0][1](messageMock);

//     // Expectations
//     expect(websocketServerHandler.subscribe_notification.subscribe).toHaveBeenCalledTimes(2);
//     expect(websocketServerHandler.set_connections).toHaveBeenCalledTimes(2);
//     expect(connectionMock.send).toHaveBeenCalledTimes(1);
//   });

//   it('should set connections for the WebSocket server', () => {
//     const subscribedStream = 'stream1';
//     const connectionMock: any = {};

//     websocketServerHandler.set_connections(subscribedStream, connectionMock);

//     expect(websocketServerHandler.websocket_connections.get(subscribedStream)).toBe(connectionMock);
//   });
// });