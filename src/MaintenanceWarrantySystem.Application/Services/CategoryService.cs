using AutoMapper;
using FluentValidation;
using MaintenanceWarrantySystem.Application.DTOs;
using MaintenanceWarrantySystem.Application.Interfaces;
using MaintenanceWarrantySystem.Application.Validators;
using MaintenanceWarrantySystem.Domain.Entities;
using MaintenanceWarrantySystem.Domain.Interfaces;

namespace MaintenanceWarrantySystem.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;
    private readonly IMapper _mapper;
    private readonly CreateCategoryDtoValidator _createValidator;
    private readonly UpdateCategoryDtoValidator _updateValidator;

    public CategoryService(
        ICategoryRepository repository,
        IMapper mapper,
        CreateCategoryDtoValidator createValidator,
        UpdateCategoryDtoValidator updateValidator)
    {
        _repository = repository;
        _mapper = mapper;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<CategoryPagedResult> GetAllAsync(int page = 1, int pageSize = 10, string? search = null)
    {
        var items = await _repository.GetPagedAsync(page, pageSize, search);
        var totalCount = await _repository.GetTotalCountAsync(search);
        var dtos = _mapper.Map<IEnumerable<CategoryDto>>(items);

        return new CategoryPagedResult(dtos, totalCount, page, pageSize,
            (int)Math.Ceiling((double)totalCount / pageSize));
    }

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id);
        return entity != null ? _mapper.Map<CategoryDto>(entity) : null;
    }

    public async Task<CategoryDto?> GetByCodeAsync(string code)
    {
        var entity = await _repository.GetByCodeAsync(code);
        return entity != null ? _mapper.Map<CategoryDto>(entity) : null;
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        await _createValidator.ValidateAndThrowAsync(dto);

        if (!await _repository.IsCodeUniqueAsync(dto.Code))
            throw new InvalidOperationException($"Mã loại '{dto.Code}' đã tồn tại");

        var entity = _mapper.Map<Category>(dto);
        var created = await _repository.AddAsync(entity);
        return _mapper.Map<CategoryDto>(created);
    }

    public async Task<CategoryDto> UpdateAsync(UpdateCategoryDto dto)
    {
        await _updateValidator.ValidateAndThrowAsync(dto);

        var existing = await _repository.GetByIdAsync(dto.Id);
        if (existing == null)
            throw new KeyNotFoundException($"Không tìm thấy loại thiết bị với ID {dto.Id}");

        if (!await _repository.IsCodeUniqueAsync(dto.Code, dto.Id))
            throw new InvalidOperationException($"Mã loại '{dto.Code}' đã tồn tại");

        _mapper.Map(dto, existing);
        var updated = await _repository.UpdateAsync(existing);
        return _mapper.Map<CategoryDto>(updated);
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
