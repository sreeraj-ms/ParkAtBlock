using System.Text.Json;
using ParkAtBlock.Models;

namespace ParkAtBlock.Repositories;

public sealed class FileSystemParkingStateRepository : IParkingStateRepository
{
    private static readonly JsonSerializerOptions SerializerOptions = new() { WriteIndented = true };

    private readonly string filePath;
    private readonly Lock syncRoot = new();

    public FileSystemParkingStateRepository(string? filePath = null)
    {
        this.filePath = filePath ?? Path.Combine(AppContext.BaseDirectory, "ParkingData.json");
    }

    public IReadOnlyCollection<ParkingSlotState> GetAll()
    {
        lock (syncRoot)
        {
            return ReadAll().Values.ToArray();
        }
    }

    public ParkingSlotState? GetBySlotId(int slotId)
    {
        lock (syncRoot)
        {
            return ReadAll().GetValueOrDefault(slotId);
        }
    }

    public ParkingSlotState? Upsert(ParkingSlotState state)
    {
        lock (syncRoot)
        {
            var states = ReadAll();
            states.TryGetValue(state.SlotId, out var previous);
            states[state.SlotId] = state;
            WriteAll(states);
            return previous;
        }
    }

    private Dictionary<int, ParkingSlotState> ReadAll()
    {
        if (!File.Exists(filePath))
        {
            return [];
        }

        var json = File.ReadAllText(filePath);
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        var states = JsonSerializer.Deserialize<List<ParkingSlotState>>(json, SerializerOptions);
        return states?.ToDictionary(s => s.SlotId) ?? [];
    }

    private void WriteAll(Dictionary<int, ParkingSlotState> states)
    {
        var directory = Path.GetDirectoryName(filePath);
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var json = JsonSerializer.Serialize(states.Values.ToList(), SerializerOptions);
        File.WriteAllText(filePath, json);
    }
}
