import { NotificationServiceHTTPServer } from "./server/NotificationServiceHTTPServer";
import * as bunyan from "bunyan";
import * as fs from 'fs';
import { program } from "commander";
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
    .description('Starts the cache service for notifications from the LDES stream stored in the solid server(s).')
    .option('-p, --port <port>', 'The port where the HTTP server will listen.', '8085')
    .action((options: any) => {
        new NotificationServiceHTTPServer(options.port, logger);
    });

program.parse(process.argv);