using _66SMS.Application.DTOs.Users;
using _66SMS.Contracts.Shared;
using MediatR;
namespace _66SMS.Application.IdentityService.Users.Queries.GetAllUserAccounts;

public class GetAllUserAccountQuery : PageRequest, IRequest<Result<PagedResult<UserAccountDto>>>
{
    
}
