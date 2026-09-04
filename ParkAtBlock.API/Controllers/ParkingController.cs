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
    public ActionResult<IReadOnlyCollection<ParkingSlotState>> GetSlots() => Ok(parkingService.GetSlots());

    [HttpGet("slots/{slotId:int}")]
    [ProducesResponseType(typeof(ParkingSlotState), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<ParkingSlotState> GetSlot(int slotId)
    {
        var slot = parkingService.GetSlot(slotId);
        return slot is null ? NotFound() : Ok(slot);
    }
}
