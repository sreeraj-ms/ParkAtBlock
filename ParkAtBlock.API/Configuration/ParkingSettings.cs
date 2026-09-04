namespace ParkAtBlock.Configuration;

public sealed class ParkingSettings
{
    public const string SectionName = "ParkingSettings";

    public double OccupiedDistanceThresholdCm { get; set; } = 50;
    public int DeviceOfflineTimeoutSeconds { get; set; } = 30;
    public string[] AllowedOrigins { get; set; } = [];
}
