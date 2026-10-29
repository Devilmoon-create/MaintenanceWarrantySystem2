using MaintenanceWarrantySystem.Application.DTOs;
using MaintenanceWarrantySystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MaintenanceWarrantySystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WarrantyClaimsController : ControllerBase
{
    private readonly IWarrantyClaimService _service;

    public WarrantyClaimsController(IWarrantyClaimService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<WarrantyClaimPagedResult>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? status = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WarrantyClaimDto>> GetById(int id)
    {
        var claim = await _service.GetByIdAsync(id);
        if (claim == null)
            return NotFound();
        return Ok(claim);
    }

    [HttpGet("device/{deviceId}")]
    public async Task<ActionResult<IEnumerable<WarrantyClaimDto>>> GetByDeviceId(int deviceId)
    {
        var claims = await _service.GetByDeviceIdAsync(deviceId);
        return Ok(claims);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<WarrantyClaimDto>>> GetByCustomerId(int customerId)
    {
        var claims = await _service.GetByCustomerIdAsync(customerId);
        return Ok(claims);
    }

    [HttpPost]
    public async Task<ActionResult<WarrantyClaimDto>> Create([FromBody] CreateWarrantyClaimDto dto)
    {
        var claim = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = claim.Id }, claim);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<WarrantyClaimDto>> Update(int id, [FromBody] UpdateWarrantyClaimDto dto)
    {
        if (id != dto.Id)
            return BadRequest("ID không khớp");

        var claim = await _service.UpdateAsync(dto);
        return Ok(claim);
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<WarrantyClaimDto>> UpdateStatus(int id, [FromBody] WarrantyClaimStatusUpdateDto dto)
    {
        if (id != dto.Id)
            return BadRequest("ID không khớp");

        // Get userId from claims (in real app, from JWT)
        var userIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userId = int.TryParse(userIdStr, out var parsedId) ? parsedId : 1;
        var claim = await _service.UpdateStatusAsync(dto, userId);
        return Ok(claim);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }

    [HttpGet("generate-code")]
    public async Task<ActionResult<string>> GenerateCode()
    {
        var code = await _service.GenerateClaimCodeAsync();
        return Ok(new { code });
    }
}
