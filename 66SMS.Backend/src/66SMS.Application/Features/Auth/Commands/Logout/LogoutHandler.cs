using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Auth.Commands.Logout
{
    public class LogoutHandler : IRequestHandler<LogoutCommand, Result<object>>
    {
        private readonly IRefreshTokenSqlRepository refreshTokenSqlRepository;

        public LogoutHandler(IRefreshTokenSqlRepository refreshTokenSqlRepository)
        {
            this.refreshTokenSqlRepository = refreshTokenSqlRepository;
        }

        public async Task<Result<object>> Handle(LogoutCommand request, CancellationToken cancellationToken)
        {
            // Tim refreshtoken 
            var stored = await refreshTokenSqlRepository.AsQueryable(asNoTracking: false)
                .Where(x => x.Token.Equals(request.Token))
                .FirstOrDefaultAsync(cancellationToken);
            // kiem tra token
            if (stored == null || !stored.IsActive)
                return Result<object>.BadRequest("Token khong hop le");
            // Revoke token
            stored.IsRevoked = true;
            stored.RevokedAt = DateTime.UtcNow;
            stored.RevokedByIp = request.IpAddress;
            // Cap nhat
            refreshTokenSqlRepository.Update(stored);
            await refreshTokenSqlRepository.SaveChangeAsync(cancellationToken);
            // return ok status
            return Result<object>.Ok();
        }
    }
}
