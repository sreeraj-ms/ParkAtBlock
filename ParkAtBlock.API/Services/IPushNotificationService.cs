using ParkAtBlock.Models;

namespace ParkAtBlock.Services;

public interface IPushNotificationService
{
    string? PublicKey { get; }
    void AddSubscription(PushSubscriptionRequest request);
    Task NotifyParkingAvailableAsync(int slotId, CancellationToken cancellationToken = default);
}