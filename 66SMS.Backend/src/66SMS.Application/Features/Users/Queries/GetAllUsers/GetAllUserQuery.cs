using _66SMS.Contracts.Shared;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.Features.Users.Queries.GetAllUsers
{
    public class GetAllUserQuery : PageRequest, IRequest<Result<PagedResult<User>>>
    {
    }
}
