export type SubscriptionServerNotification = {
    location: string,
    channelType: string,
    channelLocation: string
}

export type RedisStatus = "wait" | "reconnecting" | "connecting" | "connect" | "ready" | "close" | "end";
