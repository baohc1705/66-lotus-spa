using _66SMS.Application.DTOs.Customers;
using _66SMS.Application.DTOs.Employees;
using _66SMS.Application.DTOs.Users;
using _66SMS.Application.Features.Auth.Commands.CreatePermission;
using _66SMS.Application.Features.Auth.Commands.CreateRole;
using _66SMS.Application.Features.Customers.Commands.CreateCustomer;
using _66SMS.Application.Features.Customers.Commands.UpdateCustomer;
using _66SMS.Application.Features.Employees.Commands.CreateEmployee;
using _66SMS.Application.Features.Employees.Commands.UpdateEmployee;
using _66SMS.Application.Features.Users.Commands.CreateUser;
using _66SMS.Application.Features.Users.Commands.UpdateUser;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;

namespace _66SMS.Application.Commons.Mappers
{
    public class ApplicationMappingProfiles : Profile
    {
        public ApplicationMappingProfiles()
        {
            CreateMap<CreateUserCommand, User>();
            // Update user
            CreateMap<UpdateUserCommand, User>().ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<User, UserDto>();

            // Create permission
            CreateMap<CreatePermissionCommand, Permission>();

            // Create role
            CreateMap<CreateRoleCommand, Role>();

            // Create customer
            CreateMap<CreateCustomerCommand, User>().ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<CreateCustomerCommand, Customer>().ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Create employee
            CreateMap<CreateEmployeeCommand, User>().ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<CreateEmployeeCommand, Employee>().ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Update customer
            CreateMap<UpdateCustomerCommand, Customer>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<UpdateCustomerCommand, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Update employee
            CreateMap<UpdateEmployeeCommand, Employee>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<UpdateEmployeeCommand, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Customer DTO
            CreateMap<Customer, CustomerDTO>()
                .ForMember(dest => dest.Dob, opt => opt.MapFrom(src => src.Dob.ToDateString("dd/MM/yyyy")))
                .ForMember(dest => dest.FirstPurchaseAt, opt => opt.MapFrom(src => src.FirstPurchaseAt.ToVietnamTimeString("dd/MM/yyyy HH:mm")))
                .ForMember(dest => dest.LastPurchaseAt, opt => opt.MapFrom(src => src.LastPurchaseAt.ToVietnamTimeString("dd/MM/yyyy HH:mm")))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : null))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User != null ? src.User.Email : null))
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Employee DTO
            CreateMap<Employee, EmployeeDTO>()
                .ForMember(dest => dest.Dob, opt => opt.MapFrom(src => src.Dob.ToDateString("dd/MM/yyyy")))
                .ForMember(dest => dest.HireDate, opt => opt.MapFrom(src => src.HireDate.ToDateString("dd/MM/yyyy")))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : null))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User != null ? src.User.Email : null))
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
