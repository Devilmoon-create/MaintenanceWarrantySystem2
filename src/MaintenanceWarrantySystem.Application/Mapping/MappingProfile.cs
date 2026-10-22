using AutoMapper;
using MaintenanceWarrantySystem.Application.DTOs;
using MaintenanceWarrantySystem.Domain.Entities;

namespace MaintenanceWarrantySystem.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Customer
        CreateMap<Customer, CustomerDto>();
        CreateMap<CreateCustomerDto, Customer>();
        CreateMap<UpdateCustomerDto, Customer>();

        // Device
        CreateMap<Device, DeviceDto>()
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.Customer != null ? s.Customer.FullName : ""));
        CreateMap<CreateDeviceDto, Device>();
        CreateMap<UpdateDeviceDto, Device>();

        // MaintenanceRequest
        CreateMap<MaintenanceRequest, MaintenanceRequestDto>()
            .ForMember(d => d.DeviceName, opt => opt.MapFrom(s => s.Device != null ? s.Device.Name : ""))
            .ForMember(d => d.DeviceCode, opt => opt.MapFrom(s => s.Device != null ? s.Device.Code : ""))
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.Customer != null ? s.Customer.FullName : ""))
            .ForMember(d => d.TechnicianName, opt => opt.MapFrom(s => s.AssignedTechnician != null ? s.AssignedTechnician.FullName : ""));
        CreateMap<CreateMaintenanceRequestDto, MaintenanceRequest>()
            .ForMember(d => d.RequestCode, opt => opt.Ignore())
            .ForMember(d => d.Status, opt => opt.MapFrom(s => (int)MaintenanceStatus.Pending))
            .ForMember(d => d.RequestDate, opt => opt.MapFrom(s => DateTime.UtcNow))
            .ForMember(d => d.CreatedAt, opt => opt.MapFrom(s => DateTime.UtcNow));
        CreateMap<UpdateMaintenanceRequestDto, MaintenanceRequest>();

        // WarrantyClaim
        CreateMap<WarrantyClaim, WarrantyClaimDto>()
            .ForMember(d => d.DeviceName, opt => opt.MapFrom(s => s.Device != null ? s.Device.Name : ""))
            .ForMember(d => d.DeviceCode, opt => opt.MapFrom(s => s.Device != null ? s.Device.Code : ""))
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.Customer != null ? s.Customer.FullName : ""))
            .ForMember(d => d.ProcessedByName, opt => opt.MapFrom(s => s.ProcessedBy != null ? s.ProcessedBy.FullName : ""));
        CreateMap<CreateWarrantyClaimDto, WarrantyClaim>()
            .ForMember(d => d.ClaimCode, opt => opt.Ignore())
            .ForMember(d => d.Status, opt => opt.MapFrom(s => (int)WarrantyClaimStatus.Submitted))
            .ForMember(d => d.ClaimDate, opt => opt.MapFrom(s => DateTime.UtcNow))
            .ForMember(d => d.CreatedAt, opt => opt.MapFrom(s => DateTime.UtcNow));
        CreateMap<UpdateWarrantyClaimDto, WarrantyClaim>();
    }
}
