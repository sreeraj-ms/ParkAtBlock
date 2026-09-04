using ParkAtBlock.Models;

namespace ParkAtBlock.Repositories;

public interface IParkingStateRepository
{
    IReadOnlyCollection<ParkingSlotState> GetAll();
    ParkingSlotState? GetBySlotId(int slotId);
    ParkingSlotState? Upsert(ParkingSlotState state);
}
