using _66SMS.Application.DTOs.Users;
using _66SMS.Application.Features.Users.Commands.CreateUser;
using _66SMS.Domain.Entities;
using AutoMapper;

namespace _66SMS.Application.Commons.Mappers
{
    public class ApplicationMappingProfiles : Profile
    {
        public ApplicationMappingProfiles()
        {
            CreateMap<CreateUserCommand, User>();

            CreateMap<User, UserDto>();
        }
    }
}
