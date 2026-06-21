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
            // Find refreshtoken 
            var stored = await refreshTokenSqlRepository.AsQueryable(asNoTracking: false)
                .Where(x => x.Token.Equals(request.Token))
                .FirstOrDefaultAsync(cancellationToken);
            // Check token
            if (stored == null || !stored.IsActive)
                return Result<object>.BadRequest(UserConst.MSG_USER_INVALID_TOKEN, ErrorCodes.ERR_AUTH_TOKEN_INVALID);
            // Revoke token
            stored.IsRevoked = true;
            stored.RevokedAt = DateTime.UtcNow;
            stored.RevokedByIp = request.IpAddress;
            // Update and persist token to database
            refreshTokenSqlRepository.Update(stored);
            await refreshTokenSqlRepository.SaveChangeAsync(cancellationToken);
            // return ok status
            return Result<object>.Ok();
        }
    }
}
