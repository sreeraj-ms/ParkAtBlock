using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using ParkAtBlock.Configuration;
using ParkAtBlock.Hubs;
using ParkAtBlock.Models;
using ParkAtBlock.Repositories;

namespace ParkAtBlock.Services;

public sealed class ParkingService(
    IParkingStateRepository repository,
    IHubContext<ParkingHub> hubContext,
    IOptions<ParkingSettings> options,
    ILogger<ParkingService> logger) : IParkingService
{
    private const double MaximumDistanceCm = 10000;
    private readonly ParkingSettings settings = options.Value;

    public async Task<ParkingSlotState> ProcessEventAsync(ParkingEventRequest request, CancellationToken cancellationToken = default)
    {
        Validate(request);

        var now = DateTime.UtcNow;
        var state = new ParkingSlotState(
            request.SlotId,
            request.DeviceId!.Trim(),
            request.DistanceCm,
            request.DistanceCm < settings.OccupiedDistanceThresholdCm,
            now,
            now,
            DeviceStatus.Online);

        var previous = repository.Upsert(state);
        logger.LogInformation("Parking event received from {DeviceId} for slot {SlotId}", state.DeviceId, state.SlotId);

        if (previous is null || previous.IsOccupied != state.IsOccupied || previous.DeviceStatus != state.DeviceStatus)
        {
            logger.LogInformation("Parking slot {SlotId} changed to {Status}", state.SlotId, state.IsOccupied ? "Occupied" : "Available");
            await hubContext.Clients.All.SendAsync("ParkingSlotUpdated", state, cancellationToken);
        }

        return state;
    }

    public IReadOnlyCollection<ParkingSlotState> GetSlots() => UpdateOfflineStates(repository.GetAll());

    public ParkingSlotState? GetSlot(int slotId)
    {
        var state = repository.GetBySlotId(slotId);
        return state is null ? null : UpdateOfflineState(state);
    }

    private IReadOnlyCollection<ParkingSlotState> UpdateOfflineStates(IReadOnlyCollection<ParkingSlotState> states) =>
        states.Select(UpdateOfflineState).ToArray();

    private ParkingSlotState UpdateOfflineState(ParkingSlotState state)
    {
        if (state.DeviceStatus == DeviceStatus.Offline ||
            DateTime.UtcNow - state.LastSeenUtc <= TimeSpan.FromSeconds(settings.DeviceOfflineTimeoutSeconds))
        {
            return state;
        }

        var offlineState = state with { DeviceStatus = DeviceStatus.Offline };
        repository.Upsert(offlineState);
        logger.LogInformation("Device {DeviceId} for slot {SlotId} went offline", state.DeviceId, state.SlotId);
        return offlineState;
    }

    private static void Validate(ParkingEventRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DeviceId) || request.DeviceId.Trim().Length > 100)
        {
            throw new ArgumentException("DeviceId is required and must be 100 characters or fewer.", nameof(request));
        }

        if (request.SlotId <= 0)
        {
            throw new ArgumentException("SlotId must be greater than zero.", nameof(request));
        }

        if (double.IsNaN(request.DistanceCm) || double.IsInfinity(request.DistanceCm) || request.DistanceCm < 0 || request.DistanceCm > MaximumDistanceCm)
        {
            throw new ArgumentException("DistanceCm must be between 0 and 10000.", nameof(request));
        }
    }
}
