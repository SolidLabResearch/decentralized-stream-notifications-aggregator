import * as http from 'http';
import { CacheService } from '../service/CacheService';

export class CacheServiceHTTPServer {
    private readonly cacheService: CacheService;
    private readonly server: http.Server;

    constructor(port: number) {
        this.cacheService = new CacheService();
        this.server = http.createServer(this.request_handler.bind(this));
        this.setupServer(port);
    }

    private async setupServer(port: number) {
        await this.cacheService.connect();
        this.server.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    }

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

    private async handleNotificationPostRequest(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {

    }

    private async handleClientGetRequest(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {

    }

    private async handleNotificationDeleteRequest(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {

    }


}