using Microsoft.AspNetCore.Mvc;

namespace ParkAtBlock.Controllers;

[ApiController]
public sealed class HealthController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Get() => Ok(new { status = "Healthy" });
}
