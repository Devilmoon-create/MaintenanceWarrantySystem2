using FluentValidation;
using MaintenanceWarrantySystem.Application.DTOs;

namespace MaintenanceWarrantySystem.Application.Validators;

public class CreateDeviceDtoValidator : AbstractValidator<CreateDeviceDto>
{
    public CreateDeviceDtoValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã thiết bị không được để trống")
            .MaximumLength(20).WithMessage("Mã thiết bị tối đa 20 ký tự");

        RuleFor(x => x.SerialNumber)
            .NotEmpty().WithMessage("Số serial không được để trống")
            .MaximumLength(100).WithMessage("Số serial tối đa 100 ký tự");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên thiết bị không được để trống")
            .MaximumLength(100).WithMessage("Tên thiết bị tối đa 100 ký tự");

        RuleFor(x => x.Model)
            .MaximumLength(100).WithMessage("Model tối đa 100 ký tự");

        RuleFor(x => x.Brand)
            .MaximumLength(100).WithMessage("Thương hiệu tối đa 100 ký tự");

        RuleFor(x => x.Category)
            .InclusiveBetween(1, 7).WithMessage("Danh mục thiết bị không hợp lệ");

        RuleFor(x => x.PurchaseDate)
            .NotEmpty().WithMessage("Ngày mua không được để trống")
            .LessThanOrEqualTo(DateTime.Now).WithMessage("Ngày mua không được trong tương lai");

        RuleFor(x => x.WarrantyExpiryDate)
            .GreaterThan(x => x.PurchaseDate).When(x => x.WarrantyExpiryDate.HasValue)
            .WithMessage("Ngày hết bảo hành phải sau ngày mua");

        RuleFor(x => x.PurchasePrice)
            .GreaterThanOrEqualTo(0).WithMessage("Giá mua phải lớn hơn hoặc bằng 0");

        RuleFor(x => x.Status)
            .InclusiveBetween(1, 5).WithMessage("Trạng thái thiết bị không hợp lệ");

        RuleFor(x => x.CustomerId)
            .GreaterThan(0).WithMessage("Khách hàng không hợp lệ");
    }
}

public class UpdateDeviceDtoValidator : AbstractValidator<UpdateDeviceDto>
{
    public UpdateDeviceDtoValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("ID không hợp lệ");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã thiết bị không được để trống")
            .MaximumLength(20).WithMessage("Mã thiết bị tối đa 20 ký tự");

        RuleFor(x => x.SerialNumber)
            .NotEmpty().WithMessage("Số serial không được để trống")
            .MaximumLength(100).WithMessage("Số serial tối đa 100 ký tự");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên thiết bị không được để trống")
            .MaximumLength(100).WithMessage("Tên thiết bị tối đa 100 ký tự");

        RuleFor(x => x.Category)
            .InclusiveBetween(1, 7).WithMessage("Danh mục thiết bị không hợp lệ");

        RuleFor(x => x.Status)
            .InclusiveBetween(1, 5).WithMessage("Trạng thái thiết bị không hợp lệ");

        RuleFor(x => x.CustomerId)
            .GreaterThan(0).WithMessage("Khách hàng không hợp lệ");
    }
}
