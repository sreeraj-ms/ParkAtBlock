using System.Collections.Concurrent;
using System.Text.Json;
using Lib.Net.Http.WebPush;
using Lib.Net.Http.WebPush.Authentication;
using Microsoft.Extensions.Options;
using ParkAtBlock.Configuration;
using ParkAtBlock.Models;

namespace ParkAtBlock.Services;

public sealed class PushNotificationService(
    IOptions<WebPushSettings> options,
    ILogger<PushNotificationService> logger) : IPushNotificationService
{
    private readonly WebPushSettings settings = options.Value;
    private readonly ConcurrentDictionary<string, PushSubscription> subscriptions = new();
    private readonly PushServiceClient client = new();

    public string? PublicKey => settings.IsConfigured ? settings.PublicKey : null;

    public void AddSubscription(PushSubscriptionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Endpoint) ||
            string.IsNullOrWhiteSpace(request.Keys.P256dh) ||
            string.IsNullOrWhiteSpace(request.Keys.Auth))
        {
            throw new ArgumentException("A valid push subscription is required.");
        }

        var subscription = new PushSubscription { Endpoint = request.Endpoint };
        subscription.SetKey(PushEncryptionKeyName.P256DH, request.Keys.P256dh);
        subscription.SetKey(PushEncryptionKeyName.Auth, request.Keys.Auth);
        subscriptions[request.Endpoint] = subscription;
    }

    public async Task NotifyParkingAvailableAsync(int slotId, CancellationToken cancellationToken = default)
    {
        if (!settings.IsConfigured || subscriptions.IsEmpty) return;

        var message = new PushMessage(JsonSerializer.Serialize(new
        {
            title = "Parking available",
            body = $"Parking slot {slotId} is now available.",
            slotId,
        })) { Topic = $"parking-slot-{slotId}", TimeToLive = 300 };
        var authentication = new VapidAuthentication(settings.PublicKey, settings.PrivateKey)
        {
            Subject = settings.Subject,
        };

        foreach (var pair in subscriptions.ToArray())
        {
            try
            {
                await client.RequestPushMessageDeliveryAsync(pair.Value, message, authentication, cancellationToken);
            }
            catch (PushServiceClientException exception) when ((int?)exception.StatusCode is 404 or 410)
            {
                subscriptions.TryRemove(pair.Key, out _);
            }
            catch (Exception exception)
            {
                logger.LogWarning(exception, "Unable to send parking notification to a push subscription");
            }
        }
    }
}