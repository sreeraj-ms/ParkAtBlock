using ParkAtBlock.Models;

namespace ParkAtBlock.Repositories;

public interface IParkingStateRepository
{
    Task<IReadOnlyCollection<ParkingSlotState>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ParkingSlotState?> GetBySlotIdAsync(int slotId, CancellationToken cancellationToken = default);
    Task<ParkingSlotState?> UpsertAsync(ParkingSlotState state, CancellationToken cancellationToken = default);
}
