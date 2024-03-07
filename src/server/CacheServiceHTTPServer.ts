import * as http from 'http';
import * as url from 'url';
import { CacheService } from '../service/CacheService';
import { SubscribeNotification } from '../service/SubscribeNotification';

/**
 * A class for the HTTP server that interacts with the cache service to handle requests.
 * It stores the notifications from the solid server(s) and allows clients to retrieve them.
 * @class CacheServiceHTTPServer
 */
export class CacheServiceHTTPServer {
    private readonly cacheService: CacheService;
    private readonly server: http.Server;
    public logger: any;
    private subscription_notification: SubscribeNotification;
    private pod_url_array: string[];

    /**
     * Creates an instance of CacheServiceHTTPServer.
     * @param {number} port - The port where the HTTP server will listen.
     * @param {string[]} pod_url - The location of the Solid Pod from which the notifications are retrieved.
     * @param {*} logger - The logger object.
     * @memberof CacheServiceHTTPServer
     */
    constructor(port: number, pod_url: string[], logger: any) {
        this.logger = logger;
        this.cacheService = new CacheService();
        this.pod_url_array = pod_url;
        this.subscription_notification = new SubscribeNotification(this.pod_url_array);
        this.server = http.createServer(this.request_handler.bind(this));
        this.setupServerAndSubscribe(port);
    }
    /**
     * Sets up the HTTP server where it listens on the specified port as well as connects to the cache service.
     * @private
     * @param {number} port - The port where the HTTP server will listen.
     * @memberof CacheServiceHTTPServer
     */
    private async setupServerAndSubscribe(port: number) {
        if (await this.cacheService.get_status() === "connecting") {
            const subscription_successful = await this.subscription_notification.subscribe();
            if(subscription_successful) {
                console.log(`Subscription was successful`);
                
            }
            this.server.listen(port, () => {
                this.logger.info(`Server listening on port ${port}`);
            });
        }
        else {
            this.logger.error("Cache service is not connecting");
            await this.cacheService.connect();
        }
    }
    /**
     * Handles the requests to the HTTP server.
     * @private
     * @param {http.IncomingMessage} request - The request object.
     * @param {http.ServerResponse} response - The response object.
     * @returns {Promise<void>} - A promise which responses nothing.
     * @memberof CacheServiceHTTPServer
     */
    public async request_handler(request: http.IncomingMessage, response: http.ServerResponse) {
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
     * @memberof CacheServiceHTTPServer
     */
    private async handleNotificationPostRequest(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk.toString();
        });
        request.on('end', async () => {
            try {
                const notification = JSON.parse(body);
                const published = (new Date(notification.published).getTime()).toString();
                const resource_location = notification.object;
                try {
                    const resource_fetch_response = await fetch(resource_location, {
                        method: 'GET',
                        headers: {
                            'Accept': 'text/turtle'
                        }
                    });
                    this.logger.info("Resource fetched successfully");
                    const response_text = await resource_fetch_response.text();
                    this.cacheService.set(published, response_text);
                } catch (error) {
                    this.logger.error("Error fetching the resource: " + error);
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
     * @memberof CacheServiceHTTPServer
     */
    private async handleClientGetRequest(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
        this.logger.info(`GET request received for ${request.url}`)
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
     * @memberof CacheServiceHTTPServer
     */
    private async handleNotificationDeleteRequest(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
        const parsed_url = url.parse(request.url!, true);
        const query_parameters = parsed_url.query;
        const event_time = query_parameters.event_time as string | undefined || 'Anonymous';
        await this.cacheService.delete(event_time);
        response.writeHead(200, 'OK');
        response.end('OK');
    }


}