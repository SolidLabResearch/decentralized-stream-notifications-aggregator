import { CacheServiceHTTPServer } from "./server/CacheServiceHTTPServer";
import * as bunyan from "bunyan";
import * as fs from 'fs';
const program = require('commander');
const log_file = fs.createWriteStream('./logs/info.log', { flags: 'a' });

const logger = bunyan.createLogger({
    name: 'solid-stream-notifications-cache',
    streams: [
        {
            level: 'info',
            stream: log_file
        }
    ],
    serializers: {
        log: (log_data: any) => {
            return {
                ...log_data,
            }
        }
    }
})

program
    .version('1.0.0')
    .description('Solid Stream Notifications Cache Service')
    .name('solid-stream-notifications-cache')

program
    .command('cache-notifications')
    .description('Starts the cache service for notifications from the solid server(s).')
    .option('-p, --port <port>', 'The port where the HTTP server will listen.', '8085')
    .option('-p --pod <pod>', 'The location of the Solid Pod', 'http://localhost:3000/aggregation_pod/')
    .action((options: any) => {
        new CacheServiceHTTPServer(options.port, options.pod, logger);
    });