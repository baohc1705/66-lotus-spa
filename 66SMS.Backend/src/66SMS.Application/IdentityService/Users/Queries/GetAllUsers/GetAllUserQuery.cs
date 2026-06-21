using _66SMS.Application.DTOs.Users;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Users.Queries.GetAllUsers
{
    /// <summary>
    /// Get all user request
    /// </summary>
    public class GetAllUserQuery : PageRequest, IRequest<Result<PagedResult<UserFullDto>>>
    {
    }
}
