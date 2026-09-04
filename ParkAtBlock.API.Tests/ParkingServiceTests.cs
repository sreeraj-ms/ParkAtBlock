using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using ParkAtBlock.Configuration;
using ParkAtBlock.Hubs;
using ParkAtBlock.Models;
using ParkAtBlock.Repositories;
using ParkAtBlock.Services;
using Xunit;

namespace ParkAtBlock.Tests;

public sealed class ParkingServiceTests
{
    [Theory]
    [InlineData(30, true)]
    [InlineData(49.9, true)]
    [InlineData(50, false)]
    [InlineData(75, false)]
    public async Task ProcessEvent_determines_occupancy_from_threshold(double distance, bool occupied)
    {
        var service = CreateService();

        var state = await service.ProcessEventAsync(new ParkingEventRequest
        {
            DeviceId = "ESP32-001",
            SlotId = 1,
            DistanceCm = distance
        });

        Assert.Equal(occupied, state.IsOccupied);
        Assert.Equal(DeviceStatus.Online, state.DeviceStatus);
    }

    [Fact]
    public async Task ProcessEvent_broadcasts_only_when_state_changes()
    {
        var client = new RecordingClientProxy();
        var service = CreateService(client);

        await service.ProcessEventAsync(Event(1, 75));
        await service.ProcessEventAsync(Event(1, 80));
        await service.ProcessEventAsync(Event(1, 30));

        Assert.Equal(2, client.Messages.Count);
        Assert.All(client.Messages, message => Assert.Equal("ParkingSlotUpdated", message.Method));
    }

    [Fact]
    public async Task ProcessEvent_supports_multiple_slots_and_devices()
    {
        var service = CreateService();

        await service.ProcessEventAsync(Event(1, 30, "ESP32-001"));
        await service.ProcessEventAsync(Event(2, 75, "ESP32-002"));

        var states = service.GetSlots();
        Assert.Equal(2, states.Count);
        Assert.Contains(states, state => state.SlotId == 1 && state.IsOccupied);
        Assert.Contains(states, state => state.SlotId == 2 && !state.IsOccupied);
    }

    [Fact]
    public async Task ProcessEvent_handles_concurrent_updates()
    {
        var service = CreateService();
        var updates = Enumerable.Range(0, 100)
            .Select(index => service.ProcessEventAsync(Event(1, index % 2 == 0 ? 30 : 75)))
            .ToArray();

        await Task.WhenAll(updates);

        var state = service.GetSlot(1);
        Assert.NotNull(state);
        Assert.Single(service.GetSlots());
    }

    [Theory]
    [InlineData(0, "ESP32-001", 30)]
    [InlineData(1, "", 30)]
    [InlineData(1, "ESP32-001", -1)]
    [InlineData(1, "ESP32-001", 10001)]
    public async Task ProcessEvent_rejects_invalid_input(int slotId, string deviceId, double distance)
    {
        var service = CreateService();

        await Assert.ThrowsAsync<ArgumentException>(() => service.ProcessEventAsync(new ParkingEventRequest
        {
            DeviceId = deviceId,
            SlotId = slotId,
            DistanceCm = distance
        }));
    }

    private static ParkingEventRequest Event(int slotId, double distance, string deviceId = "ESP32-001") => new()
    {
        DeviceId = deviceId,
        SlotId = slotId,
        DistanceCm = distance
    };

    private static ParkingService CreateService(RecordingClientProxy? client = null)
    {
        client ??= new RecordingClientProxy();
        var clients = new TestHubClients(client);
        var hubContext = new TestHubContext(clients);
        return new ParkingService(
            new InMemoryParkingStateRepository(),
            hubContext,
            Options.Create(new ParkingSettings()),
            NullLogger<ParkingService>.Instance);
    }

    private sealed class TestHubContext(IHubClients clients) : IHubContext<ParkingHub>
    {
        public IHubClients Clients { get; } = clients;
        public IGroupManager Groups => throw new NotSupportedException();
    }

    private sealed class TestHubClients(IClientProxy client) : IHubClients
    {
        public IClientProxy All => client;
        public IClientProxy AllExcept(IReadOnlyList<string> excludedConnectionIds) => client;
        public IClientProxy Client(string connectionId) => client;
        public IClientProxy Clients(IReadOnlyList<string> connectionIds) => client;
        public IClientProxy Group(string groupName) => client;
        public IClientProxy GroupExcept(string groupName, IReadOnlyList<string> excludedConnectionIds) => client;
        public IClientProxy Groups(IReadOnlyList<string> groupNames) => client;
        public IClientProxy User(string userId) => client;
        public IClientProxy Users(IReadOnlyList<string> userIds) => client;
    }

    private sealed class RecordingClientProxy : IClientProxy
    {
        public List<(string Method, object?[] Arguments)> Messages { get; } = [];

        public Task SendCoreAsync(string method, object?[] args, CancellationToken cancellationToken = default)
        {
            Messages.Add((method, args));
            return Task.CompletedTask;
        }
    }
}
