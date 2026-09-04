using ParkAtBlock.Models;

namespace ParkAtBlock.Services;

public interface IParkingService
{
    Task<ParkingSlotState> ProcessEventAsync(ParkingEventRequest request, CancellationToken cancellationToken = default);
    IReadOnlyCollection<ParkingSlotState> GetSlots();
    ParkingSlotState? GetSlot(int slotId);
}
