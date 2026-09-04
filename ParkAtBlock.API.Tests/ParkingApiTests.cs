using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using ParkAtBlock.Models;
using Xunit;

namespace ParkAtBlock.Tests;

public sealed class ParkingApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public ParkingApiTests(WebApplicationFactory<Program> factory)
    {
        client = factory.CreateClient();
    }

    [Fact]
    public async Task Event_and_status_endpoints_return_current_slot()
    {
        var response = await client.PostAsJsonAsync("/api/parking/events", new
        {
            deviceId = "integration-device",
            slotId = 1,
            distanceCm = 32.5
        });

        response.EnsureSuccessStatusCode();
        var state = await response.Content.ReadFromJsonAsync<ParkingSlotState>();

        Assert.NotNull(state);
        Assert.True(state.IsOccupied);
        Assert.Equal(DeviceStatus.Online, state.DeviceStatus);

        var listResponse = await client.GetAsync("/api/parking/slots");
        listResponse.EnsureSuccessStatusCode();
        var slots = await listResponse.Content.ReadFromJsonAsync<List<ParkingSlotState>>();
        Assert.Contains(slots!, slot => slot.SlotId == 1);

        var singleResponse = await client.GetAsync("/api/parking/slots/1");
        Assert.Equal(HttpStatusCode.OK, singleResponse.StatusCode);
    }

    [Fact]
    public async Task Unknown_slot_returns_not_found()
    {
        var response = await client.GetAsync("/api/parking/slots/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
