using System.Text.Json;
using ParkAtBlock.Models;

namespace ParkAtBlock.Repositories;

public sealed class FileSystemParkingStateRepository : IParkingStateRepository
{
    private static readonly JsonSerializerOptions SerializerOptions = new() { WriteIndented = true };

    private readonly string filePath;
    private readonly SemaphoreSlim syncRoot = new(1, 1);

    public FileSystemParkingStateRepository(string? filePath = null)
    {
        this.filePath = filePath ?? Path.Combine(AppContext.BaseDirectory, "ParkingData.json");
    }

    public async Task<IReadOnlyCollection<ParkingSlotState>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        await syncRoot.WaitAsync(cancellationToken);
        try
        {
            var states = await ReadAllAsync(cancellationToken);
            return states.Values.ToArray();
        }
        finally
        {
            syncRoot.Release();
        }
    }

    public async Task<ParkingSlotState?> GetBySlotIdAsync(int slotId, CancellationToken cancellationToken = default)
    {
        await syncRoot.WaitAsync(cancellationToken);
        try
        {
            var states = await ReadAllAsync(cancellationToken);
            return states.GetValueOrDefault(slotId);
        }
        finally
        {
            syncRoot.Release();
        }
    }

    public async Task<ParkingSlotState?> UpsertAsync(ParkingSlotState state, CancellationToken cancellationToken = default)
    {
        await syncRoot.WaitAsync(cancellationToken);
        try
        {
            var states = await ReadAllAsync(cancellationToken);
            states.TryGetValue(state.SlotId, out var previous);
            states[state.SlotId] = state;
            await WriteAllAsync(states, cancellationToken);
            return previous;
        }
        finally
        {
            syncRoot.Release();
        }
    }

    private async Task<Dictionary<int, ParkingSlotState>> ReadAllAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(filePath))
        {
            return [];
        }

        var json = await File.ReadAllTextAsync(filePath, cancellationToken);
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        var states = JsonSerializer.Deserialize<List<ParkingSlotState>>(json, SerializerOptions);
        return states?.ToDictionary(s => s.SlotId) ?? [];
    }

    private async Task WriteAllAsync(Dictionary<int, ParkingSlotState> states, CancellationToken cancellationToken)
    {
        var directory = Path.GetDirectoryName(filePath);
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var json = JsonSerializer.Serialize(states.Values.ToList(), SerializerOptions);

        var tempFilePath = Path.Combine(
            string.IsNullOrEmpty(directory) ? AppContext.BaseDirectory : directory,
            $"{Path.GetFileName(filePath)}.{Guid.NewGuid():N}.tmp");

        await File.WriteAllTextAsync(tempFilePath, json, cancellationToken);
        File.Move(tempFilePath, filePath, overwrite: true);
    }
}
