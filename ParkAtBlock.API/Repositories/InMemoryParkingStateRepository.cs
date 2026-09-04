using ParkAtBlock.Models;

namespace ParkAtBlock.Repositories;

public sealed class InMemoryParkingStateRepository : IParkingStateRepository
{
    private readonly Dictionary<int, ParkingSlotState> states = [];
    private readonly Lock syncRoot = new();

    public IReadOnlyCollection<ParkingSlotState> GetAll()
    {
        lock (syncRoot)
        {
            return states.Values.ToArray();
        }
    }

    public ParkingSlotState? GetBySlotId(int slotId)
    {
        lock (syncRoot)
        {
            return states.GetValueOrDefault(slotId);
        }
    }

    public ParkingSlotState? Upsert(ParkingSlotState state)
    {
        lock (syncRoot)
        {
            states.TryGetValue(state.SlotId, out var previous);
            states[state.SlotId] = state;
            return previous;
        }
    }
}
