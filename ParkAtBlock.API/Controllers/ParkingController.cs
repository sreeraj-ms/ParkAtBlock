using Microsoft.AspNetCore.Mvc;
using ParkAtBlock.Models;
using ParkAtBlock.Services;

namespace ParkAtBlock.Controllers;

[ApiController]
[Route("api/parking")]
public sealed class ParkingController(IParkingService parkingService) : ControllerBase
{
    [HttpPost("events")]
    [ProducesResponseType(typeof(ParkingSlotState), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ParkingSlotState>> PostEvent(ParkingEventRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await parkingService.ProcessEventAsync(request, cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { error = exception.Message });
        }
    }

    [HttpGet("slots")]
    [ProducesResponseType(typeof(IReadOnlyCollection<ParkingSlotState>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<ParkingSlotState>>> GetSlots(CancellationToken cancellationToken) =>
        Ok(await parkingService.GetSlotsAsync(cancellationToken));

    [HttpGet("slots/{slotId:int}")]
    [ProducesResponseType(typeof(ParkingSlotState), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParkingSlotState>> GetSlot(int slotId, CancellationToken cancellationToken)
    {
        var slot = await parkingService.GetSlotAsync(slotId, cancellationToken);
        return slot is null ? NotFound() : Ok(slot);
    }
}
