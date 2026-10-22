using MaintenanceWarrantySystem.Application.DTOs;
using MaintenanceWarrantySystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceWarrantySystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MaintenanceRequestsController : ControllerBase
{
    private readonly IMaintenanceRequestService _service;

    public MaintenanceRequestsController(IMaintenanceRequestService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<MaintenanceRequestPagedResult>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? status = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MaintenanceRequestDto>> GetById(int id)
    {
        var request = await _service.GetByIdAsync(id);
        if (request == null)
            return NotFound();
        return Ok(request);
    }

    [HttpGet("device/{deviceId}")]
    public async Task<ActionResult<IEnumerable<MaintenanceRequestDto>>> GetByDeviceId(int deviceId)
    {
        var requests = await _service.GetByDeviceIdAsync(deviceId);
        return Ok(requests);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<MaintenanceRequestDto>>> GetByCustomerId(int customerId)
    {
        var requests = await _service.GetByCustomerIdAsync(customerId);
        return Ok(requests);
    }

    [HttpGet("technician/{technicianId}")]
    public async Task<ActionResult<IEnumerable<MaintenanceRequestDto>>> GetByTechnicianId(int technicianId)
    {
        var requests = await _service.GetByTechnicianIdAsync(technicianId);
        return Ok(requests);
    }

    [HttpPost]
    public async Task<ActionResult<MaintenanceRequestDto>> Create([FromBody] CreateMaintenanceRequestDto dto)
    {
        var request = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MaintenanceRequestDto>> Update(int id, [FromBody] UpdateMaintenanceRequestDto dto)
    {
        if (id != dto.Id)
            return BadRequest("ID không khớp");

        var request = await _service.UpdateAsync(dto);
        return Ok(request);
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<MaintenanceRequestDto>> UpdateStatus(int id, [FromBody] MaintenanceRequestStatusUpdateDto dto)
    {
        if (id != dto.Id)
            return BadRequest("ID không khớp");

        var request = await _service.UpdateStatusAsync(dto);
        return Ok(request);
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
        var code = await _service.GenerateRequestCodeAsync();
        return Ok(new { code });
    }
}
