using _66SMS.Application.DTOs.Users;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.IdentityService.Users.Queries.GetAllUserAccounts;

public class GetAllUserAccountHandler : IRequestHandler<GetAllUserAccountQuery, Result<PagedResult<UserAccountDto>>>
{
    private readonly IUserSqlRepository userSqlRepository;

    public GetAllUserAccountHandler(IUserSqlRepository userSqlRepository)
    {
        this.userSqlRepository = userSqlRepository;
    }

    public async Task<Result<PagedResult<UserAccountDto>>> Handle(GetAllUserAccountQuery request, CancellationToken cancellationToken)
    {
        var query = userSqlRepository.AsQueryable(true);

        if (!string.IsNullOrEmpty(request.Filter))
            query = query.Where(x => x.Username.Contains(request.Filter) ||
                                    x.Email.Contains(request.Filter));

        query = request.OrderBy?.ToLower() switch
        {
            "username" => request.IsDescending ? query.OrderByDescending(x => x.Username) : query.OrderBy(x => x.Username),
            "email" => request.IsDescending ? query.OrderByDescending(x => x.Email) : query.OrderBy(x => x.Email),
            "createdat" => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
            _ => request.IsDescending ? query.OrderByDescending(x => x.Username) : query.OrderBy(x => x.Username)
        };

        var dtoQuery = query.Select(x => new UserAccountDto
        {
             Username = x.Username,
             Email = x.Email,
             Role = x.UserRoles!.Select(x => x.Role!.Name).FirstOrDefault(),
             IsEmailConfirmed = x.IsEmailConfirmed,
             AccessFailedCount = x.AccessFailedCount,
             Status = x.Status,
             LastLoginAt = x.LastLoginAt,
             CreatedAt = x.CreatedAt,
             CreatedBy = x.CreatedBy,
             UpdatedAt = x.UpdatedAt,
        });

        var result = await dtoQuery.ToPagedAsync(request, cancellationToken);

        return Result<PagedResult<UserAccountDto>>.Success(result);
    }

}
