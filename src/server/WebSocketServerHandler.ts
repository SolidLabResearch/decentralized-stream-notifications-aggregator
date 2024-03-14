import * as WebSocket from 'websocket';
import { SubscribeNotification } from '../service/SubscribeNotification';
/**
 * This class is used to handle the WebSocket server.
 * @class WebSocketServerHandler
 */
export class WebSocketServerHandler {

    public websocket_server: any;
    public websocket_connections: Map<string, WebSocket>;
    public subscribe_notification: SubscribeNotification;
    /**
     * Creates an instance of WebSocketServerHandler.
     * @param {WebSocket.server} websocket_server - The WebSocket server.
     * @memberof WebSocketServerHandler
     */
    constructor(websocket_server: WebSocket.server) {
        this.websocket_server = websocket_server;
        this.websocket_connections = new Map<string, WebSocket>();
        this.subscribe_notification = new SubscribeNotification();
    }
    /**
     * Handles the communication for the WebSocket server, including subscribing to the notification server and sending messages to the client.
     * @memberof WebSocketServerHandler
     */
    public async handle_communication() {
        console.log(`Handling the communication for the WebSocket server.`);
        this.websocket_server.on('connect', () => {
            console.log(`Connected to the WebSocket server.`);
        });

        this.websocket_server.on('request', (request: any) => {
            const connection = request.accept('solid-stream-notifications-aggregator', request.origin);
            connection.on('message', (message: any) => {
                if (message.type === 'utf8') {
                    const message_utf8 = message.utf8Data;
                    const ws_message = JSON.parse(message_utf8);
                    if (Object.keys(ws_message).includes('subscribe')) {
                        console.log(`Received a subscribe message from the client.`);
                        const stream_to_subscribe = ws_message.subscribe;
                        for (const stream of stream_to_subscribe) {
                            this.subscribe_notification.subscribe(stream);
                            console.log(`Subscribed to the stream: ${stream}`);
                            this.set_connections(stream, connection);
                        }
                    }
                    else if (Object.keys(ws_message).includes('event')) {
                        const connection = this.websocket_connections.get(ws_message.stream);
                        if (connection !== undefined) {
                            connection.send(JSON.stringify(ws_message));
                        }
                    }
                }
            });
        });
    }
    /**
     * Sets the connections for the WebSocket server's Map.
     * @param {string} subscribed_stream - The stream to subscribe to.
     * @param {WebSocket} connection - The WebSocket connection.
     * @memberof WebSocketServerHandler
     */
    public set_connections(subscribed_stream: string, connection: WebSocket): void {
        this.websocket_connections.set(subscribed_stream, connection);
    }
}