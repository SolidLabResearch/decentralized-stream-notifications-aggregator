import * as WebSocket from 'websocket';
import { CacheService } from '../service/CacheService';
import { SubscribeNotification } from '../service/SubscribeNotification';

export class WebSocketServerHandler {

    public websocket_server: any;
    public websocket_connections: Map<string, WebSocket>;
    public subscribe_notification: SubscribeNotification;


    constructor(websocket_server: WebSocket.server) {
        this.websocket_server = websocket_server;
        this.websocket_connections = new Map<string, WebSocket>();
        this.subscribe_notification = new SubscribeNotification();
    }

    public async handle_communication(cache_service: CacheService) {
        console.log(`Handling the communication for the WebSocket server.`);
        this.websocket_server.on('connect', (connection: any) => {
            console.log(`Connection received from the client with address: ${connection.remoteAddress}`);
        });

        this.websocket_server.on('request', (request: any) => {
            const connection = request.accept('solid-stream-notifications-aggregator', request.origin);
            connection.on('message', (message: any) => {
                if (message.type === 'utf8') {
                    const message_utf8 = message.utf8Data;
                    const ws_message = JSON.parse(message_utf8);
                    if (Object.keys(ws_message).includes('subscribe')) {
                        console.log(`Received a subscribe message from the client.`);
                        let stream_to_subscribe = ws_message.subscribe;
                        for (let stream of stream_to_subscribe) {
                            // We first subscribe to the latest inbox of the LDES stream.
                            this.subscribe_notification.subscribe_inbox(stream);
                            console.log(`Subscribed to the stream: ${stream}`);
                            this.set_connections(stream, connection);
                        }
                    }
                    else if (Object.keys(ws_message).includes('event')) {
                        console.log(`Received a new event message from the client.`);
                        let connection = this.websocket_connections.get(ws_message.stream);
                        if (connection !== undefined) {
                            connection.send(JSON.stringify(ws_message));
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

    public set_connections(subscribed_stream: string, connection: WebSocket): void {
        this.websocket_connections.set(subscribed_stream, connection);
    }
}