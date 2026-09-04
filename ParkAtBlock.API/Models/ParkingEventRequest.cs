using System.ComponentModel.DataAnnotations;

namespace ParkAtBlock.Models;

public sealed class ParkingEventRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string? DeviceId { get; set; }

    [Range(1, int.MaxValue)]
    public int SlotId { get; set; }

    [Range(0, 10000)]
    public double DistanceCm { get; set; }
}
