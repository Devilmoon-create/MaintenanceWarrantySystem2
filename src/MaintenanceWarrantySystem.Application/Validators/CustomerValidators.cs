using FluentValidation;
using MaintenanceWarrantySystem.Application.DTOs;

namespace MaintenanceWarrantySystem.Application.Validators;

public class CreateCustomerDtoValidator : AbstractValidator<CreateCustomerDto>
{
    public CreateCustomerDtoValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã khách hàng không được để trống")
            .MaximumLength(20).WithMessage("Mã khách hàng tối đa 20 ký tự");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ tên không được để trống")
            .MaximumLength(100).WithMessage("Họ tên tối đa 100 ký tự");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Số điện thoại không được để trống")
            .MaximumLength(20).WithMessage("Số điện thoại tối đa 20 ký tự")
            .Matches(@"^[0-9+\-\s()]+$").WithMessage("Số điện thoại không hợp lệ");

        RuleFor(x => x.Email)
            .MaximumLength(100).WithMessage("Email tối đa 100 ký tự")
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email)).WithMessage("Email không hợp lệ");

        RuleFor(x => x.Address)
            .MaximumLength(500).WithMessage("Địa chỉ tối đa 500 ký tự");

        RuleFor(x => x.TaxCode)
            .MaximumLength(20).WithMessage("Mã số thuế tối đa 20 ký tự")
            .When(x => !string.IsNullOrEmpty(x.TaxCode));

        RuleFor(x => x.CompanyName)
            .MaximumLength(200).WithMessage("Tên công ty tối đa 200 ký tự")
            .When(x => !string.IsNullOrEmpty(x.CompanyName));

        RuleFor(x => x.Type)
            .InclusiveBetween(1, 2).WithMessage("Loại khách hàng phải là 1 (Cá nhân) hoặc 2 (Doanh nghiệp)");
    }
}

public class UpdateCustomerDtoValidator : AbstractValidator<UpdateCustomerDto>
{
    public UpdateCustomerDtoValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("ID không hợp lệ");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã khách hàng không được để trống")
            .MaximumLength(20).WithMessage("Mã khách hàng tối đa 20 ký tự");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ tên không được để trống")
            .MaximumLength(100).WithMessage("Họ tên tối đa 100 ký tự");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Số điện thoại không được để trống")
            .MaximumLength(20).WithMessage("Số điện thoại tối đa 20 ký tự")
            .Matches(@"^[0-9+\-\s()]+$").WithMessage("Số điện thoại không hợp lệ");

        RuleFor(x => x.Email)
            .MaximumLength(100).WithMessage("Email tối đa 100 ký tự")
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email)).WithMessage("Email không hợp lệ");
    }
}
