using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;
namespace _66SMS.Application.IdentityService.Users.Queries.GetAllUserAccounts;

public class GetAllUserAccountQuery : PageRequest, IRequest<Result<PagedResult<UserAccountDto>>>
{
    
}
