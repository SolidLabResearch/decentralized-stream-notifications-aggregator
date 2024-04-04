import * as WebSocket from 'websocket';
import { SubscribeNotification } from '../service/SubscribeNotification';
import { extract_ldp_inbox } from '../utils/Util';

/**
 *
 */
export class WebSocketServerHandler {

    public websocket_server: any;
    public websocket_connections: Map<string, WebSocket[]>;
    public subscribe_notification: SubscribeNotification;

    /**
     * Creates an instance of WebSocketServerHandler.
     * @param {WebSocket.server} websocket_server - The WebSocket server.
     */
    constructor(websocket_server: WebSocket.server) {
        this.websocket_server = websocket_server;
        this.websocket_connections = new Map<string, WebSocket[]>();
        this.subscribe_notification = new SubscribeNotification();
    }

    /**
     * Handles the communication for the WebSocket server.
     */
    public async handle_communication() {
        console.log(`Handling the communication for the WebSocket server.`);
        this.websocket_server.on('connect', (connection: any) => {
            console.log(`Connection received from the client with address: ${connection.remoteAddress}`);
        });

        this.websocket_server.on('request', (request: any) => {
            const connection = request.accept('solid-stream-notifications-aggregator', request.origin);
            connection.on('message', async(message: any) => {
                if (message.type === 'utf8') {
                    const message_utf8 = message.utf8Data;
                    const ws_message = JSON.parse(message_utf8);
                    if (Object.keys(ws_message).includes('subscribe')) {
                        console.log(`Received a subscribe message from the client.`);
                        const stream_to_subscribe = ws_message.subscribe;
                        for (const stream of stream_to_subscribe) {
                            console.log(`Subscribed to the stream: ${stream}`);
                            this.set_connections(stream, connection);
                        }
                    }
                    else if (Object.keys(ws_message).includes('event')) {
                        console.log(`Received a new event message from the client.`);
                        const connection = this.websocket_connections.get(ws_message.stream);
                        if (connection !== undefined) {
                            for (const [stream, connections] of this.websocket_connections) {
                                if (stream == ws_message.stream) {
                                    for (const connection of connections) {
                                        connection.send(JSON.stringify(ws_message));
                                    }
                                }
                            }
                        }
                    }
                    else if (Object.keys(ws_message).includes('container_location')) {
                        console.log(`Received a new inbox container location message from the client.`);
                        const inbox_container_location = ws_message.container_location;
                        this.subscribe_notification.subscribe_inbox(inbox_container_location);
                        console.log(`Subscribed to the inbox container location: ${inbox_container_location}`);
                    }
                    else {
                        console.log(`Received an unknown message from the client with the following content: ${message_utf8}`);
                        console.log(`The message is not recognized and supported by the Solid Stream Notifications Aggregator.`);
                    }
                }
            });
        });
    }

    /**
     * Sets the connections for the WebSocket server's Map.
     * @param {string} subscribed_stream - The subscribed stream.
     * @param {WebSocket} connection - The WebSocket connection.
     */
    public async set_connections(subscribed_stream: string, connection: WebSocket){
        if (!this.websocket_connections.has(subscribed_stream)) {   
            const stream_inbox = await extract_ldp_inbox(subscribed_stream) as string;            
            this.subscribe_notification.subscribe_inbox(stream_inbox);                     
            this.websocket_connections.set(subscribed_stream, [connection]);
        }
        else {
            const connections = this.websocket_connections.get(subscribed_stream);
            if (connections !== undefined) {
                connections.push(connection);
                this.websocket_connections.set(subscribed_stream, connections);
            }

        }
    }
}