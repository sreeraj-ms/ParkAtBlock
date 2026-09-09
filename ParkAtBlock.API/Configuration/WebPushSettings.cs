namespace ParkAtBlock.Configuration;

public sealed class WebPushSettings
{
    public const string SectionName = "WebPush";

    public string PublicKey { get; set; } = "";
    public string PrivateKey { get; set; } = "";
    public string Subject { get; set; } = "";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(PublicKey) &&
        !string.IsNullOrWhiteSpace(PrivateKey) &&
        !string.IsNullOrWhiteSpace(Subject);
}