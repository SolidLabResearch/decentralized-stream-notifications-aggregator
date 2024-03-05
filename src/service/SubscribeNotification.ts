export class SubscribeNotification {
    public solid_pod_urls: string[];

    constructor(solid_pod_urls: string[]) {
        this.solid_pod_urls = solid_pod_urls;
    }

    public async subscribe() {
        console.log(`Subscribing to notifications for ${this.solid_pod_urls}...`);

    }

}


/**
 * sending the server `http://localhost:3000/.notifications/WebhookChannel2023/` 
 {
  "@context": [ "https://www.w3.org/ns/solid/notification/v1" ],
  "type": "http://www.w3.org/ns/solid/notifications#WebhookChannel2023",
  "topic": "http://localhost:3000/aggregation_pod/",
  "sendTo": "http://localhost:3001/"
}
*/