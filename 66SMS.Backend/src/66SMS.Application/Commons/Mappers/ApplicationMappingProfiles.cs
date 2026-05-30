using _66SMS.Application.DTOs.Customers;
using _66SMS.Application.DTOs.Users;
using _66SMS.Application.Features.Auth.Commands.CreatePermission;
using _66SMS.Application.Features.Auth.Commands.CreateRole;
using _66SMS.Application.Features.Customers.Commands.CreateCustomer;
using _66SMS.Application.Features.Customers.Commands.UpdateCustomer;
using _66SMS.Application.Features.Users.Commands.CreateUser;
using _66SMS.Application.Features.Users.Commands.UpdateUser;
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

            // Update customer
            CreateMap<UpdateCustomerCommand, Customer>().ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<UpdateCustomerCommand, User>().ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            // Customer DTO
            CreateMap<Customer, CustomerDTO>().ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
