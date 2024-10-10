import { fork, ChildProcess } from 'child_process';

export function startNotificationAggregatorProcess() {
    const aggregator_process: ChildProcess = fork('./dist/index.js')

    aggregator_process.on('message', (message: string) => {
        console.log(`Message from the notification aggregator process: ${message}`);
    });

    aggregator_process.on('exit', (code: number, signal: string) => {
        console.log(`Notification aggregator process exited with code ${code} and signal ${signal}`);
    });
}

startNotificationAggregatorProcess();