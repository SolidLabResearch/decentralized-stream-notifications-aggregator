import * as WebSocket from 'websocket';
import { SubscribeNotification } from '../service/SubscribeNotification';
/**
 * This class is used to handle the WebSocket server.
 * @class WebSocketServerHandler
 */
export class WebSocketServerHandler {

    public websocket_server: any;
    public websocket_connections: Map<string, WebSocket[]>;
    public subscribe_notification: SubscribeNotification;
    /**
     * Creates an instance of WebSocketServerHandler.
     * @param {WebSocket.server} websocket_server - The WebSocket server.
     * @memberof WebSocketServerHandler
     */
    constructor(websocket_server: WebSocket.server) {
        this.websocket_server = websocket_server;
        this.websocket_connections = new Map<string, WebSocket[]>();
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
            connection.on('message', async (message: any) => {
                if (message.type === 'utf8') {
                    const message_utf8 = message.utf8Data;
                    const ws_message = JSON.parse(message_utf8);
                    if (Object.keys(ws_message).includes('subscribe')) {
                        const streams_to_subscribe = ws_message.subscribe;
                        for (const stream_to_subscribe of streams_to_subscribe){
                            this.set_connections(stream_to_subscribe, connection);
                        }
                    }
                    else if (Object.keys(ws_message).includes('event')){
                        console.log(`Received an event message from the notification server.`);
                        for (const [stream, connection] of this.websocket_connections){
                            if(ws_message.stream === stream){
                                for(const conn of connection){
                                    conn.send(JSON.stringify(ws_message));
                                }
                            }
                        }
                    }
                }
            });
            connection.on('close', (reasonCode: number, description: string) => {
                console.log(`Peer ${connection.remoteAddress} disconnected.`);
                console.log(`Reason code: ${reasonCode}`);
                console.log(`Description: ${description}`);
                
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
        if (!this.websocket_connections.has(subscribed_stream)) {   
            this.subscribe_notification.subscribe(subscribed_stream);                     
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