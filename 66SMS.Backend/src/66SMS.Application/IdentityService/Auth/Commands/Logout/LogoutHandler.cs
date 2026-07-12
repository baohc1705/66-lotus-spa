using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.IdentityService.Auth.Commands.Logout
{
    /// <summary>
    /// Handler for <see cref="LogoutCommand"/>
    /// </summary>
    public class LogoutHandler : IRequestHandler<LogoutCommand, Result<object>>
    {
        private readonly IRefreshTokenSqlRepository refreshTokenSqlRepository;

        public LogoutHandler(IRefreshTokenSqlRepository refreshTokenSqlRepository)
        {
            this.refreshTokenSqlRepository = refreshTokenSqlRepository;
        }

        public async Task<Result<object>> Handle(LogoutCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Token))
                return Result<object>.Ok(); // Không có cookie → coi như đã logout

            var stored = await refreshTokenSqlRepository.AsQueryable(asNoTracking: false)
                .Where(x => x.Token.Equals(request.Token))
                .FirstOrDefaultAsync(cancellationToken);

            if (stored == null || !stored.IsActive)
                return Result<object>.Ok(); // Token đã hết / revoke — vẫn logout OK phía client

            stored.IsRevoked = true;
            stored.RevokedAt = DateTime.UtcNow;
            stored.RevokedByIp = request.IpAddress;
            refreshTokenSqlRepository.Update(stored);
            await refreshTokenSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<object>.Ok();
        }
    }
}
