using AutoMapper;
using FluentValidation;
using MaintenanceWarrantySystem.Application.DTOs;
using MaintenanceWarrantySystem.Application.Interfaces;
using MaintenanceWarrantySystem.Application.Validators;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;

namespace MaintenanceWarrantySystem.Application.Services;

public class DeviceService : IDeviceService
{
    private readonly IDeviceRepository _repository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IMapper _mapper;
    private readonly CreateDeviceDtoValidator _createValidator;
    private readonly UpdateDeviceDtoValidator _updateValidator;

    public DeviceService(
        IDeviceRepository repository,
        ICustomerRepository customerRepository,
        IMapper mapper,
        CreateDeviceDtoValidator createValidator,
        UpdateDeviceDtoValidator updateValidator)
    {
        _repository = repository;
        _customerRepository = customerRepository;
        _mapper = mapper;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<DevicePagedResult> GetAllAsync(int page = 1, int pageSize = 10, string? search = null)
    {
        var items = await _repository.GetPagedAsync(page, pageSize, search);
        var totalCount = await _repository.GetTotalCountAsync(search);
        var dtos = _mapper.Map<IEnumerable<DeviceDto>>(items);
        
        return new DevicePagedResult(dtos, totalCount, page, pageSize,
            (int)Math.Ceiling((double)totalCount / pageSize));
    }

    public async Task<DeviceDto?> GetByIdAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<DeviceDto>(entity) : null;
    }

    public async Task<DeviceDto?> GetByCodeAsync(string code)
    {
        var entity = await _repository.GetByCodeAsync(code);
        return entity != null ? _mapper.Map<DeviceDto>(entity) : null;
    }

    public async Task<DeviceDto?> GetBySerialNumberAsync(string serialNumber)
    {
        var entity = await _repository.GetBySerialNumberAsync(serialNumber);
        return entity != null ? _mapper.Map<DeviceDto>(entity) : null;
    }

    public async Task<IEnumerable<DeviceDto>> GetByCustomerIdAsync(int customerId)
    {
        var entities = await _repository.GetByCustomerIdAsync(customerId);
        return _mapper.Map<IEnumerable<DeviceDto>>(entities);
    }

    public async Task<IEnumerable<DeviceWarrantyExpiryDto>> GetWarrantyExpiringSoonAsync(int days = 30)
    {
        var entities = await _repository.GetWarrantyExpiringSoonAsync(days);
        return entities.Select(e => new DeviceWarrantyExpiryDto(
            e.Id,
            e.Code,
            e.Name,
            e.SerialNumber,
            e.WarrantyExpiryDate!.Value,
            (e.WarrantyExpiryDate.Value - DateTime.Now).Days,
            e.Customer?.FullName ?? "",
            e.Customer?.Phone ?? ""
        ));
    }

    public async Task<DeviceDto> CreateAsync(CreateDeviceDto dto)
    {
        await _createValidator.ValidateAndThrowAsync(dto);

        var customer = await _customerRepository.GetByIdAsync(dto.CustomerId);
        if (customer == null)
            throw new KeyNotFoundException($"Không tìm thấy khách hàng với ID {dto.CustomerId}");

        if (!await _repository.IsCodeUniqueAsync(dto.Code))
            throw new InvalidOperationException($"Mã thiết bị '{dto.Code}' đã tồn tại");

        if (!await _repository.IsSerialUniqueAsync(dto.SerialNumber))
            throw new InvalidOperationException($"Số serial '{dto.SerialNumber}' đã tồn tại");

        var entity = _mapper.Map<Device>(dto);
        entity.Customer = customer;
        var created = await _repository.AddAsync(entity);
        return _mapper.Map<DeviceDto>(created);
    }

    public async Task<DeviceDto> UpdateAsync(UpdateDeviceDto dto)
    {
        await _updateValidator.ValidateAndThrowAsync(dto);

        var existing = await _repository.GetByIdAsync(dto.Id);
        if (existing == null)
            throw new KeyNotFoundException($"Không tìm thấy thiết bị với ID {dto.Id}");

        var customer = await _customerRepository.GetByIdAsync(dto.CustomerId);
        if (customer == null)
            throw new KeyNotFoundException($"Không tìm thấy khách hàng với ID {dto.CustomerId}");

        if (!await _repository.IsCodeUniqueAsync(dto.Code, dto.Id))
            throw new InvalidOperationException($"Mã thiết bị '{dto.Code}' đã tồn tại");

        if (!await _repository.IsSerialUniqueAsync(dto.SerialNumber, dto.Id))
            throw new InvalidOperationException($"Số serial '{dto.SerialNumber}' đã tồn tại");

        _mapper.Map(dto, existing);
        existing.Customer = customer;
        var updated = await _repository.UpdateAsync(existing);
        return _mapper.Map<DeviceDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }

    public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null)
    {
        return await _repository.IsCodeUniqueAsync(code, excludeId);
    }

    public async Task<bool> IsSerialUniqueAsync(string serial, int? excludeId = null)
    {
        return await _repository.IsSerialUniqueAsync(serial, excludeId);
    }
}
