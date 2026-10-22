using AutoMapper;
using FluentValidation;
using MaintenanceWarrantySystem.Application.DTOs;
using MaintenanceWarrantySystem.Application.Interfaces;
using MaintenanceWarrantySystem.Application.Validators;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;

namespace MaintenanceWarrantySystem.Application.Services;

public class MaintenanceRequestService : IMaintenanceRequestService
{
    private readonly IMaintenanceRequestRepository _repository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IUserRepository _userRepository;
    private readonly IDeviceMaintenanceHistoryRepository _historyRepository;
    private readonly IMapper _mapper;
    private readonly CreateMaintenanceRequestDtoValidator _createValidator;
    private readonly UpdateMaintenanceRequestDtoValidator _updateValidator;
    private readonly MaintenanceRequestStatusUpdateDtoValidator _statusValidator;

    public MaintenanceRequestService(
        IMaintenanceRequestRepository repository,
        IDeviceRepository deviceRepository,
        ICustomerRepository customerRepository,
        IUserRepository userRepository,
        IDeviceMaintenanceHistoryRepository historyRepository,
        IMapper mapper,
        CreateMaintenanceRequestDtoValidator createValidator,
        UpdateMaintenanceRequestDtoValidator updateValidator,
        MaintenanceRequestStatusUpdateDtoValidator statusValidator)
    {
        _repository = repository;
        _deviceRepository = deviceRepository;
        _customerRepository = customerRepository;
        _userRepository = userRepository;
        _historyRepository = historyRepository;
        _mapper = mapper;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _statusValidator = statusValidator;
    }

    public async Task<MaintenanceRequestPagedResult> GetAllAsync(int page = 1, int pageSize = 10, string? search = null, int? status = null)
    {
        var items = await _repository.GetPagedAsync(page, pageSize, search);
        var totalCount = await _repository.GetTotalCountAsync(search);
        
        if (status.HasValue)
        {
            items = items.Where(x => x.Status == (MaintenanceStatus)status.Value);
            totalCount = items.Count();
        }
        
        var dtos = _mapper.Map<IEnumerable<MaintenanceRequestDto>>(items);
        
        return new MaintenanceRequestPagedResult(dtos, totalCount, page, pageSize,
            (int)Math.Ceiling((double)totalCount / pageSize));
    }

    public async Task<MaintenanceRequestDto?> GetByIdAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<MaintenanceRequestDto>(entity) : null;
    }

    public async Task<IEnumerable<MaintenanceRequestDto>> GetByDeviceIdAsync(int deviceId)
    {
        var entities = await _repository.GetByDeviceIdAsync(deviceId);
        return _mapper.Map<IEnumerable<MaintenanceRequestDto>>(entities);
    }

    public async Task<IEnumerable<MaintenanceRequestDto>> GetByCustomerIdAsync(int customerId)
    {
        var entities = await _repository.GetByCustomerIdAsync(customerId);
        return _mapper.Map<IEnumerable<MaintenanceRequestDto>>(entities);
    }

    public async Task<IEnumerable<MaintenanceRequestDto>> GetByTechnicianIdAsync(int technicianId)
    {
        var entities = await _repository.GetByTechnicianIdAsync(technicianId);
        return _mapper.Map<IEnumerable<MaintenanceRequestDto>>(entities);
    }

    public async Task<MaintenanceRequestDto> CreateAsync(CreateMaintenanceRequestDto dto)
    {
        await _createValidator.ValidateAndThrowAsync(dto);

        var device = await _deviceRepository.GetByIdAsync(dto.DeviceId);
        if (device == null)
            throw new KeyNotFoundException($"Không tìm thấy thiết bị với ID {dto.DeviceId}");

        var customer = await _customerRepository.GetByIdAsync(dto.CustomerId);
        if (customer == null)
            throw new KeyNotFoundException($"Không tìm thấy khách hàng với ID {dto.CustomerId}");

        var requestCode = await _repository.GenerateRequestCodeAsync();

        var entity = _mapper.Map<MaintenanceRequest>(dto);
        entity.RequestCode = requestCode;
        entity.Device = device;
        entity.Customer = customer;
        entity.Status = MaintenanceStatus.Pending;
        entity.RequestDate = DateTime.UtcNow;
        entity.CreatedAt = DateTime.UtcNow;

        var created = await _repository.AddAsync(entity);
        return _mapper.Map<MaintenanceRequestDto>(created);
    }

    public async Task<MaintenanceRequestDto> UpdateAsync(UpdateMaintenanceRequestDto dto)
    {
        await _updateValidator.ValidateAndThrowAsync(dto);

        var existing = await _repository.GetByIdAsync(dto.Id);
        if (existing == null)
            throw new KeyNotFoundException($"Không tìm thấy yêu cầu bảo trì với ID {dto.Id}");

        if (dto.AssignedTechnicianId.HasValue)
        {
            var technician = await _userRepository.GetByIdAsync(dto.AssignedTechnicianId.Value);
            if (technician == null)
                throw new KeyNotFoundException($"Không tìm thấy kỹ thuật viên với ID {dto.AssignedTechnicianId.Value}");
            existing.AssignedTechnician = technician;
        }

        _mapper.Map(dto, existing);
        var updated = await _repository.UpdateAsync(existing);
        return _mapper.Map<MaintenanceRequestDto>(updated);
    }

    public async Task<MaintenanceRequestDto> UpdateStatusAsync(MaintenanceRequestStatusUpdateDto dto)
    {
        await _statusValidator.ValidateAndThrowAsync(dto);

        var existing = await _repository.GetByIdAsync(dto.Id);
        if (existing == null)
            throw new KeyNotFoundException($"Không tìm thấy yêu cầu bảo trì với ID {dto.Id}");

        var oldStatus = existing.Status;
        existing.Status = (MaintenanceStatus)dto.Status;

        if (dto.StartedAt.HasValue)
            existing.StartedAt = dto.StartedAt.Value;
        if (dto.CompletedAt.HasValue)
            existing.CompletedAt = dto.CompletedAt.Value;
        if (dto.ActualCost.HasValue)
            existing.ActualCost = dto.ActualCost.Value;
        if (!string.IsNullOrEmpty(dto.TechnicianNotes))
            existing.TechnicianNotes = dto.TechnicianNotes;
        if (!string.IsNullOrEmpty(dto.ReplacementParts))
            existing.ReplacementParts = dto.ReplacementParts;

        // Update device status based on maintenance status
        if (dto.Status == (int)MaintenanceStatus.InProgress)
        {
            var device = await _deviceRepository.GetByIdAsync(existing.DeviceId);
            if (device != null)
            {
                device.Status = DeviceStatus.UnderMaintenance;
                await _deviceRepository.UpdateAsync(device);
            }
        }
        else if (dto.Status == (int)MaintenanceStatus.Completed)
        {
            var device = await _deviceRepository.GetByIdAsync(existing.DeviceId);
            if (device != null)
            {
                device.Status = DeviceStatus.Active;
                await _deviceRepository.UpdateAsync(device);
            }

            // Create maintenance history
            var history = new DeviceMaintenanceHistory
            {
                DeviceId = existing.DeviceId,
                MaintenanceRequestId = existing.Id,
                ActionPerformed = $"Bảo trì: {existing.Title}",
                PartsReplaced = dto.ReplacementParts ?? "",
                Cost = dto.ActualCost ?? 0,
                PerformedAt = DateTime.UtcNow,
                PerformedById = existing.AssignedTechnicianId ?? 0,
                Notes = dto.TechnicianNotes,
                CreatedAt = DateTime.UtcNow
            };
            await _historyRepository.AddAsync(history);
        }

        var updated = await _repository.UpdateAsync(existing);
        return _mapper.Map<MaintenanceRequestDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }

    public async Task<string> GenerateRequestCodeAsync()
    {
        return await _repository.GenerateRequestCodeAsync();
    }
}
