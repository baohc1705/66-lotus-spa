using _66SMS.Application.DTOs.Users;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Users.Queries.GetAllUsers
{
    public class GetAllUserQuery : PageRequest, IRequest<Result<PagedResult<UserDto>>>
    {
    }
}
