using AutoMapper;
using FluentValidation;
using MaintenanceWarrantySystem.Application.DTOs;
using MaintenanceWarrantySystem.Application.Interfaces;
using MaintenanceWarrantySystem.Application.Validators;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;

namespace MaintenanceWarrantySystem.Application.Services;

public class WarrantyClaimService : IWarrantyClaimService
{
    private readonly IWarrantyClaimRepository _repository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IUserRepository _userRepository;
    private readonly IWarrantyClaimHistoryRepository _historyRepository;
    private readonly IMapper _mapper;
    private readonly CreateWarrantyClaimDtoValidator _createValidator;
    private readonly UpdateWarrantyClaimDtoValidator _updateValidator;
    private readonly WarrantyClaimStatusUpdateDtoValidator _statusValidator;

    public WarrantyClaimService(
        IWarrantyClaimRepository repository,
        IDeviceRepository deviceRepository,
        ICustomerRepository customerRepository,
        IUserRepository userRepository,
        IWarrantyClaimHistoryRepository historyRepository,
        IMapper mapper,
        CreateWarrantyClaimDtoValidator createValidator,
        UpdateWarrantyClaimDtoValidator updateValidator,
        WarrantyClaimStatusUpdateDtoValidator statusValidator)
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

    public async Task<WarrantyClaimPagedResult> GetAllAsync(int page = 1, int pageSize = 10, string? search = null, int? status = null)
    {
        var items = await _repository.GetPagedAsync(page, pageSize, search);
        var totalCount = await _repository.GetTotalCountAsync(search);
        
        if (status.HasValue)
        {
            items = items.Where(x => x.Status == (WarrantyClaimStatus)status.Value);
            totalCount = items.Count();
        }
        
        var dtos = _mapper.Map<IEnumerable<WarrantyClaimDto>>(items);
        
        return new WarrantyClaimPagedResult(dtos, totalCount, page, pageSize,
            (int)Math.Ceiling((double)totalCount / pageSize));
    }

    public async Task<WarrantyClaimDto?> GetByIdAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<WarrantyClaimDto>(entity) : null;
    }

    public async Task<IEnumerable<WarrantyClaimDto>> GetByDeviceIdAsync(int deviceId)
    {
        var entities = await _repository.GetByDeviceIdAsync(deviceId);
        return _mapper.Map<IEnumerable<WarrantyClaimDto>>(entities);
    }

    public async Task<IEnumerable<WarrantyClaimDto>> GetByCustomerIdAsync(int customerId)
    {
        var entities = await _repository.GetByCustomerIdAsync(customerId);
        return _mapper.Map<IEnumerable<WarrantyClaimDto>>(entities);
    }

    public async Task<WarrantyClaimDto> CreateAsync(CreateWarrantyClaimDto dto)
    {
        await _createValidator.ValidateAndThrowAsync(dto);

        var device = await _deviceRepository.GetByIdAsync(dto.DeviceId);
        if (device == null)
            throw new KeyNotFoundException($"Không tìm thấy thiết bị với ID {dto.DeviceId}");

        var customer = await _customerRepository.GetByIdAsync(dto.CustomerId);
        if (customer == null)
            throw new KeyNotFoundException($"Không tìm thấy khách hàng với ID {dto.CustomerId}");

        // Check if device is still under warranty
        if (device.WarrantyExpiryDate.HasValue && device.WarrantyExpiryDate.Value < DateTime.UtcNow)
            throw new InvalidOperationException("Thiết bị đã hết hạn bảo hành");

        var claimCode = await _repository.GenerateClaimCodeAsync();

        var entity = _mapper.Map<WarrantyClaim>(dto);
        entity.ClaimCode = claimCode;
        entity.Device = device;
        entity.Customer = customer;
        entity.Status = WarrantyClaimStatus.Submitted;
        entity.ClaimDate = DateTime.UtcNow;
        entity.CreatedAt = DateTime.UtcNow;

        var created = await _repository.AddAsync(entity);
        return _mapper.Map<WarrantyClaimDto>(created);
    }

    public async Task<WarrantyClaimDto> UpdateAsync(UpdateWarrantyClaimDto dto)
    {
        await _updateValidator.ValidateAndThrowAsync(dto);

        var existing = await _repository.GetByIdAsync(dto.Id);
        if (existing == null)
            throw new KeyNotFoundException($"Không tìm thấy yêu cầu bảo hành với ID {dto.Id}");

        if (dto.ProcessedById.HasValue)
        {
            var processor = await _userRepository.GetByIdAsync(dto.ProcessedById.Value);
            if (processor == null)
                throw new KeyNotFoundException($"Không tìm thấy người xử lý với ID {dto.ProcessedById.Value}");
            existing.ProcessedBy = processor;
        }

        _mapper.Map(dto, existing);
        var updated = await _repository.UpdateAsync(existing);
        return _mapper.Map<WarrantyClaimDto>(updated);
    }

    public async Task<WarrantyClaimDto> UpdateStatusAsync(WarrantyClaimStatusUpdateDto dto, int userId)
    {
        await _statusValidator.ValidateAndThrowAsync(dto);

        var existing = await _repository.GetByIdAsync(dto.Id);
        if (existing == null)
            throw new KeyNotFoundException($"Không tìm thấy yêu cầu bảo hành với ID {dto.Id}");

        var oldStatus = existing.Status;
        existing.Status = (WarrantyClaimStatus)dto.Status;

        if (dto.ApprovedAmount.HasValue)
            existing.ApprovedAmount = dto.ApprovedAmount.Value;
        if (!string.IsNullOrEmpty(dto.Resolution))
            existing.Resolution = dto.Resolution;
        if (!string.IsNullOrEmpty(dto.RejectionReason))
            existing.RejectionReason = dto.RejectionReason;

        // Update dates based on status
        switch (dto.Status)
        {
            case (int)WarrantyClaimStatus.Approved:
                existing.ApprovedDate = DateTime.UtcNow;
                break;
            case (int)WarrantyClaimStatus.Resolved:
                existing.ResolvedDate = DateTime.UtcNow;
                break;
        }

        // Create history record
        var history = new WarrantyClaimHistory
        {
            WarrantyClaimId = existing.Id,
            PreviousStatus = (WarrantyClaimStatus)oldStatus,
            NewStatus = (WarrantyClaimStatus)dto.Status,
            Comment = dto.Comment ?? string.Empty,
            ChangedById = userId,
            CreatedAt = DateTime.UtcNow
        };
        await _historyRepository.AddAsync(history);

        // Update device status if under warranty repair
        if (dto.Status == (int)WarrantyClaimStatus.InProgress)
        {
            var device = await _deviceRepository.GetByIdAsync(existing.DeviceId);
            if (device != null)
            {
                device.Status = DeviceStatus.UnderWarranty;
                await _deviceRepository.UpdateAsync(device);
            }
        }
        else if (dto.Status == (int)WarrantyClaimStatus.Resolved || dto.Status == (int)WarrantyClaimStatus.Rejected)
        {
            var device = await _deviceRepository.GetByIdAsync(existing.DeviceId);
            if (device != null)
            {
                device.Status = DeviceStatus.Active;
                await _deviceRepository.UpdateAsync(device);
            }
        }

        var updated = await _repository.UpdateAsync(existing);
        return _mapper.Map<WarrantyClaimDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }

    public async Task<string> GenerateClaimCodeAsync()
    {
        return await _repository.GenerateClaimCodeAsync();
    }
}
