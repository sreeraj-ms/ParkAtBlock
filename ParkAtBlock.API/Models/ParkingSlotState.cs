using System.Text.Json.Serialization;

namespace ParkAtBlock.Models;

public sealed record ParkingSlotState(
    int SlotId,
    string DeviceId,
    double DistanceCm,
    bool IsOccupied,
    DateTime LastUpdatedUtc,
    DateTime LastSeenUtc,
    DeviceStatus DeviceStatus);

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum DeviceStatus
{
    Online,
    Offline
}
