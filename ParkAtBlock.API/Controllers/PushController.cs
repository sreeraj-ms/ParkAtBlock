using Microsoft.AspNetCore.Mvc;
using ParkAtBlock.Models;
using ParkAtBlock.Services;

namespace ParkAtBlock.Controllers;

[ApiController]
[Route("api/push")]
public sealed class PushController(IPushNotificationService pushNotificationService) : ControllerBase
{
    [HttpGet("public-key")]
    public ActionResult<object> GetPublicKey() => Ok(new { publicKey = pushNotificationService.PublicKey });

    [HttpPost("subscriptions")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult AddSubscription(PushSubscriptionRequest request)
    {
        try
        {
            pushNotificationService.AddSubscription(request);
            return NoContent();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { error = exception.Message });
        }
    }
}