using ParkAtBlock.Models;

namespace ParkAtBlock.Services;

public interface IParkingService
{
    Task<ParkingSlotState> ProcessEventAsync(ParkingEventRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ParkingSlotState>> GetSlotsAsync(CancellationToken cancellationToken = default);
    Task<ParkingSlotState?> GetSlotAsync(int slotId, CancellationToken cancellationToken = default);
}
