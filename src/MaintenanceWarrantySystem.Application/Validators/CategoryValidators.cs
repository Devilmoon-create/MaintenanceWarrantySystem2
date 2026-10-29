using FluentValidation;
using MaintenanceWarrantySystem.Application.DTOs;

namespace MaintenanceWarrantySystem.Application.Validators;

public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
{
    public CreateCategoryDtoValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã loại thiết bị không được để trống")
            .MaximumLength(20).WithMessage("Mã loại thiết bị tối đa 20 ký tự");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên loại thiết bị không được để trống")
            .MaximumLength(100).WithMessage("Tên loại thiết bị tối đa 100 ký tự");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Mô tả tối đa 500 ký tự")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.DefaultWarrantyMonths)
            .GreaterThanOrEqualTo(0).WithMessage("Thời gian bảo hành mặc định phải lớn hơn hoặc bằng 0");

        RuleFor(x => x.MaintenanceCycleMonths)
            .GreaterThanOrEqualTo(0).WithMessage("Chu kỳ bảo trì phải lớn hơn hoặc bằng 0");
    }
}

public class UpdateCategoryDtoValidator : AbstractValidator<UpdateCategoryDto>
{
    public UpdateCategoryDtoValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("ID không hợp lệ");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã loại thiết bị không được để trống")
            .MaximumLength(20).WithMessage("Mã loại thiết bị tối đa 20 ký tự");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên loại thiết bị không được để trống")
            .MaximumLength(100).WithMessage("Tên loại thiết bị tối đa 100 ký tự");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Mô tả tối đa 500 ký tự")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.DefaultWarrantyMonths)
            .GreaterThanOrEqualTo(0).WithMessage("Thời gian bảo hành mặc định phải lớn hơn hoặc bằng 0");

        RuleFor(x => x.MaintenanceCycleMonths)
            .GreaterThanOrEqualTo(0).WithMessage("Chu kỳ bảo trì phải lớn hơn hoặc bằng 0");
    }
}
