namespace ParkAtBlock.Models;

public sealed record PushSubscriptionRequest(
    string Endpoint,
    PushSubscriptionKeys Keys);

public sealed record PushSubscriptionKeys(
    string P256dh,
    string Auth);