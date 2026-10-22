using AutoMapper;
using FluentValidation;
using MaintenanceWarrantySystem.Application.DTOs;
using MaintenanceWarrantySystem.Application.Interfaces;
using MaintenanceWarrantySystem.Application.Validators;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;

namespace MaintenanceWarrantySystem.Application.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _repository;
    private readonly IMapper _mapper;
    private readonly CreateCustomerDtoValidator _createValidator;
    private readonly UpdateCustomerDtoValidator _updateValidator;

    public CustomerService(
        ICustomerRepository repository,
        IMapper mapper,
        CreateCustomerDtoValidator createValidator,
        UpdateCustomerDtoValidator updateValidator)
    {
        _repository = repository;
        _mapper = mapper;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<CustomerPagedResult> GetAllAsync(int page = 1, int pageSize = 10, string? search = null)
    {
        var items = await _repository.GetPagedAsync(page, pageSize, search);
        var totalCount = await _repository.GetTotalCountAsync(search);
        var dtos = _mapper.Map<IEnumerable<CustomerDto>>(items);
        
        return new CustomerPagedResult(dtos, totalCount, page, pageSize, 
            (int)Math.Ceiling((double)totalCount / pageSize));
    }

    public async Task<CustomerDto?> GetByIdAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<CustomerDto>(entity) : null;
    }

    public async Task<CustomerDto?> GetByCodeAsync(string code)
    {
        var entity = await _repository.GetByCodeAsync(code);
        return entity != null ? _mapper.Map<CustomerDto>(entity) : null;
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto)
    {
        await _createValidator.ValidateAndThrowAsync(dto);
        
        if (!await _repository.IsCodeUniqueAsync(dto.Code))
            throw new InvalidOperationException($"Mã khách hàng '{dto.Code}' đã tồn tại");

        var entity = _mapper.Map<Customer>(dto);
        var created = await _repository.AddAsync(entity);
        return _mapper.Map<CustomerDto>(created);
    }

    public async Task<CustomerDto> UpdateAsync(UpdateCustomerDto dto)
    {
        await _updateValidator.ValidateAndThrowAsync(dto);
        
        var existing = await _repository.GetByIdAsync(dto.Id);
        if (existing == null)
            throw new KeyNotFoundException($"Không tìm thấy khách hàng với ID {dto.Id}");

        if (!await _repository.IsCodeUniqueAsync(dto.Code, dto.Id))
            throw new InvalidOperationException($"Mã khách hàng '{dto.Code}' đã tồn tại");

        _mapper.Map(dto, existing);
        var updated = await _repository.UpdateAsync(existing);
        return _mapper.Map<CustomerDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }

    public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null)
    {
        return await _repository.IsCodeUniqueAsync(code, excludeId);
    }
}
