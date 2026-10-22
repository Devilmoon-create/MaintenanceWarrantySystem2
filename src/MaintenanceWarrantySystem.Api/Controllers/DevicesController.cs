using MaintenanceWarrantySystem.Application.DTOs;
using MaintenanceWarrantySystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceWarrantySystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _service;

    public DevicesController(IDeviceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<DevicePagedResult>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search);
        return Ok(result);
    }

    [HttpGet("warranty-expiring")]
    public async Task<ActionResult<IEnumerable<DeviceWarrantyExpiryDto>>> GetWarrantyExpiringSoon(
        [FromQuery] int days = 30)
    {
        var result = await _service.GetWarrantyExpiringSoonAsync(days);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DeviceDto>> GetById(int id)
    {
        var device = await _service.GetByIdAsync(id);
        if (device == null)
            return NotFound();
        return Ok(device);
    }

    [HttpGet("code/{code}")]
    public async Task<ActionResult<DeviceDto>> GetByCode(string code)
    {
        var device = await _service.GetByCodeAsync(code);
        if (device == null)
            return NotFound();
        return Ok(device);
    }

    [HttpGet("serial/{serialNumber}")]
    public async Task<ActionResult<DeviceDto>> GetBySerialNumber(string serialNumber)
    {
        var device = await _service.GetBySerialNumberAsync(serialNumber);
        if (device == null)
            return NotFound();
        return Ok(device);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<DeviceDto>>> GetByCustomerId(int customerId)
    {
        var devices = await _service.GetByCustomerIdAsync(customerId);
        return Ok(devices);
    }

    [HttpPost]
    public async Task<ActionResult<DeviceDto>> Create([FromBody] CreateDeviceDto dto)
    {
        var device = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = device.Id }, device);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DeviceDto>> Update(int id, [FromBody] UpdateDeviceDto dto)
    {
        if (id != dto.Id)
            return BadRequest("ID không khớp");

        var device = await _service.UpdateAsync(dto);
        return Ok(device);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
