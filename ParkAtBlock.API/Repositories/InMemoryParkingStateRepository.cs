using ParkAtBlock.Models;

namespace ParkAtBlock.Repositories;

public sealed class InMemoryParkingStateRepository : IParkingStateRepository
{
    private readonly Dictionary<int, ParkingSlotState> states = [];
    private readonly Lock syncRoot = new();

    public Task<IReadOnlyCollection<ParkingSlotState>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        lock (syncRoot)
        {
            IReadOnlyCollection<ParkingSlotState> result = states.Values.ToArray();
            return Task.FromResult(result);
        }
    }

    public Task<ParkingSlotState?> GetBySlotIdAsync(int slotId, CancellationToken cancellationToken = default)
    {
        lock (syncRoot)
        {
            return Task.FromResult(states.GetValueOrDefault(slotId));
        }
    }

    public Task<ParkingSlotState?> UpsertAsync(ParkingSlotState state, CancellationToken cancellationToken = default)
    {
        lock (syncRoot)
        {
            states.TryGetValue(state.SlotId, out var previous);
            states[state.SlotId] = state;
            return Task.FromResult(previous);
        }
    }
}
