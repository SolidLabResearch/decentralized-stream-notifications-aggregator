import * as http from 'http';
import * as url from 'url';
import { CacheService } from '../service/CacheService';
import * as websocket from 'websocket';
import axios from 'axios';
import { SubscribeNotification } from '../service/SubscribeNotification';
import { WebSocketServerHandler } from './WebSocketServerHandler';

/**
 * A class for the HTTP server that interacts with the cache service to handle requests.
 * It stores the notifications from the solid server(s) and allows clients to retrieve them.
 * @class NotificationServiceHTTPServer
 */
export class NotificationServiceHTTPServer {
    private readonly cacheService: CacheService;
    private readonly server: http.Server;
    public connection: any;
    public client: any;
    public logger: any;
    public subscription_notification: SubscribeNotification;
    private websocket_server: any;
    public websocket_handler: WebSocketServerHandler;

    /**
     * Creates an instance of NotificationServiceHTTPServer.
     * @param {number} port - The port where the HTTP server will listen.
     * @param {*} logger - The logger object.
     * @memberof NotificationServiceHTTPServer
     */
    constructor(port: number, logger: any) {
        this.logger = logger;
        this.cacheService = new CacheService();
        this.connection = websocket.connection;
        this.client = new websocket.client();
        this.subscription_notification = new SubscribeNotification();
        this.server = http.createServer(this.request_handler.bind(this));
        this.websocket_server = new websocket.server({
            httpServer: this.server
        });
        this.websocket_handler = new WebSocketServerHandler(this.websocket_server);
        this.setupServer(port);
        this.connect_to_websocket_server('ws://localhost:8085/');
        this.websocket_handler.handle_communication();

    }
    /**
     * Sets up the HTTP server where it listens on the specified port as well as connects to the cache service.
     * @private
     * @param {number} port - The port where the HTTP server will listen.
     * @memberof NotificationServiceHTTPServer
     */
    private async setupServer(port: number) {
        this.server.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    }
    /**
     * Handles the requests to the HTTP server.
     * @private
     * @param {http.IncomingMessage} request - The request object.
     * @param {http.ServerResponse} response - The response object.
     * @returns {Promise<void>} - A promise which responses nothing.
     * @memberof NotificationServiceHTTPServer
     */
    public async request_handler(request: http.IncomingMessage, response: http.ServerResponse) {
        console.log(`Request received for ${request.url}`);
        if (request.method === 'POST') {
            await this.handleNotificationPostRequest(request, response);
        }
        else if (request.method === 'GET') {
            await this.handleClientGetRequest(request, response);
        }
        else if (request.method === 'DELETE') {
            await this.handleNotificationDeleteRequest(request, response);
        }
        else {
            response.writeHead(405, 'Method Not Allowed');
            response.end('Method Not Allowed');
        }
    }
    /**
     * Handles the POST requests to the HTTP server, which are notifications from the solid server(s).
     * @private
     * @param {http.IncomingMessage} request - The request object.
     * @param {http.ServerResponse} response - The response object.
     * @returns {Promise<void>}
     * @memberof NotificationServiceHTTPServer
     */
    private async handleNotificationPostRequest(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk.toString();
        });
        request.on('end', async () => {
            try {
                const notification = JSON.parse(body);
                const published_time = (new Date(notification.published).getTime()).toString();
                const stream = notification.target.replace(/\/\d+\/$/, '/');
                const key = `stream:${stream}:${published_time}`;
                const resource_location = notification.object;
                if (this.check_if_container(resource_location) === true) {
                    const parsed_notification = JSON.stringify({ "stream": stream, "published_time": published_time, "container_location": resource_location });
                    this.send_to_websocket_server(parsed_notification);
                }
                else if (this.check_if_container(resource_location) === false) {
                    try {
                        let time_before_fetch = Date.now();
                        const response_fetch_response = await axios.get(resource_location, {
                            headers: {
                                'Accept': 'text/turtle'
                            }
                        });
                        let time_post_fetch = Date.now();
                        this.logger.info(`${time_post_fetch - time_before_fetch}`);
                        const response_text = response_fetch_response.data;
                        // set the response in the cache, with the key as the LDES stream and the published time.
                        // set the time to live for the cache to 60 seconds.
                        console.log("Setting the response in the cache");
                        await this.cacheService.set(key, response_text);
                        await this.cacheService.setTimeToLive(key, 60);
                        const parsed_notification = JSON.stringify({ "stream": stream, "published_time": published_time, "event": response_text });
                        this.send_to_websocket_server(parsed_notification);
                    } catch (error) {
                        this.logger.error("Error fetching the resource: " + error)
                    }
                } else {
                    throw new Error("The resource location is neither a container nor a resource. This SHOULD NOT happen.");
                }
                response.writeHead(200, 'OK');
                response.end('OK');
            } catch (error) {
                response.writeHead(400, 'Bad Request');
                response.end('Bad Request');
            }
        });
    }
    /**
     * Handles the GET requests to the HTTP server, which are requests from the clients to retrieve the notifications.
     * @private
     * @param {http.IncomingMessage} request - The request object.
     * @param {http.ServerResponse} response - The response object.
     * @returns {Promise<void>}
     * @memberof NotificationServiceHTTPServer
     */
    private async handleClientGetRequest(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
        this.logger.info(`GET_request_received_for_${request.url}`)
        console.log(`GET request received for ${request.url}`);
        const parsed_url = url.parse(request.url!, true);
        const query_parameters = parsed_url.query;
        const event_time = query_parameters.event_time as string | undefined || 'Anonymous';
        response.writeHead(200, 'OK', { 'Content-Type': 'text/turtle' });
        response.end(await this.cacheService.get(event_time));
        response.destroy();
        response.on('finish', () => {
            console.log(`GET request for ${request.url} has been handled`);

        })
    }
    /**
     * Handles the DELETE requests to the HTTP server.
     * @private
     * @param {http.IncomingMessage} request - The request object.
     * @param {http.ServerResponse} response - The response object.
     * @returns {Promise<void>} - A promise which responses nothing.
     * @memberof NotificationServiceHTTPServer
     */
    private async handleNotificationDeleteRequest(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
        const parsed_url = url.parse(request.url!, true);
        const query_parameters = parsed_url.query;
        const event_time = query_parameters.event_time as string | undefined || 'Anonymous';
        await this.cacheService.delete(event_time);
        response.writeHead(200, 'OK');
        response.end('OK');
    }

    /**
     * Sends a message to the WebSocket server.
     * @param {string} message - The message to send to the WebSocket server.
     */
    public send_to_websocket_server(message: string) {
        if (this.connection.connected) {
            this.connection.sendUTF(message);
        }
        else {
            this.connect_to_websocket_server('ws://localhost:8085/').then(() => {
                console.log(`The connection with the websocket server was not established. It has been established now.`);
            });
        }
    }

    /**
     * Connects to the WebSocket server.
     * @param {string} wss_url - The URL of the WebSocket server.
     */
    public async connect_to_websocket_server(wss_url: string) {
        this.client.connect(wss_url, 'solid-stream-notifications-aggregator');
        this.client.on('connect', (connection: typeof websocket.connection) => {
            this.connection = connection;
        });

        this.client.setMaxListeners(Infinity);
        this.client.on('connectFailed', (error: any) => {
            this.logger.error(`Connection to the WebSocket server failed:`, error);
        });
    }

    /**
     * Checks if the resource location is a container.
     * @param {string} resource_location - The location of the resource.
     * @returns {boolean} - Returns true if the resource location is a container. Returns false if the resource location is not a container.
     */
    public check_if_container(resource_location: string): boolean {
        if (resource_location.endsWith('/')) {
            return true;
        }
        else {
            return false;
        }
    }
}