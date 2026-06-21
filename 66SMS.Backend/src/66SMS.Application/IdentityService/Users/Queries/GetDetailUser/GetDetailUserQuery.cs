using _66SMS.Application.DTOs.Users;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Users.Queries.GetDetailUser
{
    public class GetDetailUserQuery : IRequest<Result<UserFullDto>>
    {
        public int Id { get; set; }
    }
}
