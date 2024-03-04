import * as http from 'http';
import { CacheService } from '../service/CacheService';

/**
 * A class for the HTTP server that interacts with the cache service to handle requests.
 * It stores the notifications from the solid server(s) and allows clients to retrieve them.
 * @class CacheServiceHTTPServer
 */
export class CacheServiceHTTPServer {
    private readonly cacheService: CacheService;
    private readonly server: http.Server;
    private pod_url: string;
    /**
     * Creates an instance of CacheServiceHTTPServer.
     * @param {number} port - The port where the HTTP server will listen.
     * @param {string} pod_url - The location of the Solid Pod from which the notifications are retrieved.
     * @param {*} logger - The logger object.
     * @memberof CacheServiceHTTPServer
     */
    constructor(port: number, pod_url: string, logger: any) {
        this.cacheService = new CacheService();
        this.pod_url = pod_url;
        this.server = http.createServer(this.request_handler.bind(this));
        this.setupServer(port);
    }
    /**
     * Sets up the HTTP server where it listens on the specified port as well as connects to the cache service.
     * @private
     * @param {number} port - The port where the HTTP server will listen.
     * @memberof CacheServiceHTTPServer
     */
    private async setupServer(port: number) {
        await this.cacheService.connect();
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
     * @memberof CacheServiceHTTPServer
     */
    private async request_handler(request: http.IncomingMessage, response: http.ServerResponse) {
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

    }


}