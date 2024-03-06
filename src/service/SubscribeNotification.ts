import { extract_ldp_inbox, extract_subscription_server } from "../utils/Util";

/**
 * This class is used to subscribe to the notification server for real-time notifications.
 * @class SubscribeNotification
 */
export class SubscribeNotification {
    private ldes_streams: string[];
    /**
     * Creates an instance of SubscribeNotification.
     * @param {string[]} streams - An array of LDES streams to subscribe to, for real-time notifications.
     * @memberof SubscribeNotification
     */
    constructor(streams: string[]) {
        this.ldes_streams = streams;
    }

    /**
     * Subscribes to the notification server for each LDES stream in the constructor, using the inbox and subscription server.
     * @returns {(Promise<boolean | undefined>)} - Returns a promise with a boolean or undefined. If the subscription is successful, it returns true. If the subscription fails, it throws an error.
     * @memberof SubscribeNotification
     */
    public async subscribe(): Promise<boolean | undefined> {
        for (const stream of this.ldes_streams) {
            const inbox = await extract_ldp_inbox(stream) as string;
            const subscription_server = await extract_subscription_server(inbox);
            if (subscription_server === undefined) {
                throw new Error("Subscription server is undefined.");
            } else {
                const response = await fetch(subscription_server.location, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/ld+json'
                    },
                    body: JSON.stringify({
                        "@context": ["https://www.w3.org/ns/solid/notification/v1"],
                        "type": "http://www.w3.org/ns/solid/notifications#WebhookChannel2023",
                        "topic": inbox,
                        "sendTo": "http://localhost:8085/"
                    })
                });
                if (response.status === 200) {                    
                    return true;
                }
                else {
                    throw new Error("The subscription to the notification server failed.");
                }
            }
        }
    }
}
