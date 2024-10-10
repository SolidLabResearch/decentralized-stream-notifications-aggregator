import { NotificationServiceHTTPServer } from "./server/NotificationServiceHTTPServer";
import * as bunyan from "bunyan";
import * as fs from 'fs';
import { program } from "commander";
const log_file = fs.createWriteStream('./logs/info.log', { flags: 'a' });
const resource_used_log_file = `./logs/resource_used.csv`;

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
});

interface MemoryUsage {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
}

fs.writeFileSync(resource_used_log_file, `timestamp, cpu_user, cpu_system, rss, heapTotal, heapUsed, external\n`);


function logCpuMemoryUsage() {
    const cpuUsage = process.cpuUsage(); // in microseconds
    const memoryUsage: MemoryUsage = process.memoryUsage(); // in bytes
    const timestamp = Date.now();
    const logData = `${timestamp}, ${cpuUsage.user}, ${cpuUsage.system}, ${memoryUsage.rss}, ${memoryUsage.heapTotal}, ${memoryUsage.heapUsed}, ${memoryUsage.external}\n`;
    fs.appendFileSync(resource_used_log_file, logData);
}

setInterval(logCpuMemoryUsage, 500);

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