using FluentValidation;
using MaintenanceWarrantySystem.Application.DTOs;

namespace MaintenanceWarrantySystem.Application.Validators;

public class CreateWarrantyClaimDtoValidator : AbstractValidator<CreateWarrantyClaimDto>
{
    public CreateWarrantyClaimDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tiêu đề không được để trống")
            .MaximumLength(200).WithMessage("Tiêu đề tối đa 200 ký tự");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Mô tả không được để trống");

        RuleFor(x => x.DefectDescription)
            .NotEmpty().WithMessage("Mô tả lỗi không được để trống");

        RuleFor(x => x.Type)
            .InclusiveBetween(1, 3).WithMessage("Loại yêu cầu bảo hành không hợp lệ (1-3)");

        RuleFor(x => x.ClaimAmount)
            .GreaterThanOrEqualTo(0).WithMessage("Số tiền yêu cầu phải lớn hơn hoặc bằng 0");

        RuleFor(x => x.DeviceId)
            .GreaterThan(0).WithMessage("Thiết bị không hợp lệ");

        RuleFor(x => x.CustomerId)
            .GreaterThan(0).WithMessage("Khách hàng không hợp lệ");
    }
}

public class UpdateWarrantyClaimDtoValidator : AbstractValidator<UpdateWarrantyClaimDto>
{
    public UpdateWarrantyClaimDtoValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("ID không hợp lệ");

        RuleFor(x => x.Type)
            .InclusiveBetween(1, 3).WithMessage("Loại yêu cầu bảo hành không hợp lệ");

        RuleFor(x => x.Status)
            .InclusiveBetween(1, 7).WithMessage("Trạng thái không hợp lệ");

        RuleFor(x => x.ClaimAmount)
            .GreaterThanOrEqualTo(0).WithMessage("Số tiền yêu cầu phải lớn hơn hoặc bằng 0");

        RuleFor(x => x.ApprovedAmount)
            .GreaterThanOrEqualTo(0).WithMessage("Số tiền duyệt phải lớn hơn hoặc bằng 0");
    }
}

public class WarrantyClaimStatusUpdateDtoValidator : AbstractValidator<WarrantyClaimStatusUpdateDto>
{
    public WarrantyClaimStatusUpdateDtoValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("ID không hợp lệ");

        RuleFor(x => x.Status)
            .InclusiveBetween(1, 7).WithMessage("Trạng thái không hợp lệ");

        RuleFor(x => x.Comment)
            .NotEmpty().WithMessage("Nhận xét không được để trống khi thay đổi trạng thái");
    }
}
