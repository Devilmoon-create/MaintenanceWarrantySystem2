using FluentValidation;
using MaintenanceWarrantySystem.Application.DTOs;

namespace MaintenanceWarrantySystem.Application.Validators;

public class CreateMaintenanceRequestDtoValidator : AbstractValidator<CreateMaintenanceRequestDto>
{
    public CreateMaintenanceRequestDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tiêu đề không được để trống")
            .MaximumLength(200).WithMessage("Tiêu đề tối đa 200 ký tự");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Mô tả không được để trống");

        RuleFor(x => x.Type)
            .InclusiveBetween(1, 4).WithMessage("Loại bảo trì không hợp lệ (1-4)");

        RuleFor(x => x.Priority)
            .InclusiveBetween(1, 4).WithMessage("Mức độ ưu tiên không hợp lệ (1-4)");

        RuleFor(x => x.EstimatedCost)
            .GreaterThanOrEqualTo(0).WithMessage("Chi phí dự kiến phải lớn hơn hoặc bằng 0");

        RuleFor(x => x.DeviceId)
            .GreaterThan(0).WithMessage("Thiết bị không hợp lệ");

        RuleFor(x => x.CustomerId)
            .GreaterThan(0).WithMessage("Khách hàng không hợp lệ");
    }
}

public class UpdateMaintenanceRequestDtoValidator : AbstractValidator<UpdateMaintenanceRequestDto>
{
    public UpdateMaintenanceRequestDtoValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("ID không hợp lệ");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tiêu đề không được để trống")
            .MaximumLength(200).WithMessage("Tiêu đề tối đa 200 ký tự");

        RuleFor(x => x.Type)
            .InclusiveBetween(1, 4).WithMessage("Loại bảo trì không hợp lệ");

        RuleFor(x => x.Priority)
            .InclusiveBetween(1, 4).WithMessage("Mức độ ưu tiên không hợp lệ");

        RuleFor(x => x.Status)
            .InclusiveBetween(1, 8).WithMessage("Trạng thái không hợp lệ");

        RuleFor(x => x.EstimatedCost)
            .GreaterThanOrEqualTo(0).WithMessage("Chi phí dự kiến phải lớn hơn hoặc bằng 0");

        RuleFor(x => x.ActualCost)
            .GreaterThanOrEqualTo(0).WithMessage("Chi phí thực tế phải lớn hơn hoặc bằng 0");
    }
}

public class MaintenanceRequestStatusUpdateDtoValidator : AbstractValidator<MaintenanceRequestStatusUpdateDto>
{
    public MaintenanceRequestStatusUpdateDtoValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("ID không hợp lệ");

        RuleFor(x => x.Status)
            .InclusiveBetween(1, 8).WithMessage("Trạng thái không hợp lệ");
    }
}
