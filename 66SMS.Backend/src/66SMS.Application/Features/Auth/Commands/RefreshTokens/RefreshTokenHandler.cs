using _66SMS.Application.DTOs.Identity;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace _66SMS.Application.Features.Auth.Commands.RefreshTokens
{
    public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, Result<TokenResponseDTO>>
    {
        private readonly IRefreshTokenSqlRepository refreshTokenSqlRepository;
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IJwtService jwtService;
        private readonly IOptions<JwtSettings> jwtOptions;

        public RefreshTokenHandler(IRefreshTokenSqlRepository refreshTokenSqlRepository, IUserSqlRepository userSqlRepository, IJwtService jwtService, IOptions<JwtSettings> jwtOptions)
        {
            this.refreshTokenSqlRepository = refreshTokenSqlRepository;
            this.userSqlRepository = userSqlRepository;
            this.jwtService = jwtService;
            this.jwtOptions = jwtOptions;
        }

        public async Task<Result<TokenResponseDTO>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            // Tim token trong refresh token db
            var stored = await refreshTokenSqlRepository.FindSingleAsync(x => x.Token.Equals(request.Token), asNoTracking: false, ct: cancellationToken);

            if (stored == null)
                return Result<TokenResponseDTO>.BadRequest("Token khong hop le");

            // Phat hien reuse attack
            if (stored.IsRevoked)
            {
                var allToken = await refreshTokenSqlRepository.GetListAsync(x => x.UserId == stored.UserId, asNoTracking: false, ct: cancellationToken);
                foreach (var token in allToken.Where(x => x.IsActive))
                {
                    token.IsRevoked = true;
                    token.RevokedAt = DateTime.UtcNow;
                    token.RevokedByIp = request.IpAddress;
                    refreshTokenSqlRepository.Update(token);
                }

                await refreshTokenSqlRepository.SaveChangeAsync(cancellationToken);
                return Result<TokenResponseDTO>.BadRequest("Phai hien token bat thuong");
            }

            // kiem tra neu token con han khong
            if (stored.IsExpired)
                return Result<TokenResponseDTO>.BadRequest("Refresh token da het han");

            // Kiem tra user co hop le
            var user = await userSqlRepository.FindSingleAsync(
                predicate: x => x.Id == stored.UserId,
                include: q => q
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission),
                asNoTracking: false,
                ct: cancellationToken);

            if (user == null || user.LogoutEnabled)
                return Result<TokenResponseDTO>.BadRequest("Tai khoan khong hop le");

            // Rotate token
            stored.IsRevoked = true;
            stored.RevokedAt = DateTime.UtcNow;
            stored.RevokedByIp = request.IpAddress;
            refreshTokenSqlRepository.Update(stored);

            var newRawToken = jwtService.GenerateRefreshToken();
            // create new token
            var newRefreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = newRawToken,
                ExpiresAt = DateTime.UtcNow.AddDays(jwtOptions.Value.RefreshTokenExpiryDays),
                CreatedByIp = request.IpAddress,
            };
            refreshTokenSqlRepository.Add(newRefreshToken);

            var permissions = user.UserRoles
                .Where(ur => ur.Role.IsActived)
                .SelectMany(ur => ur.Role.RolePermissions)
                .Select(rp => rp.Permission.PermissionKey)
                .Distinct()
                .ToList();
            var accessToken = jwtService.GenerateAccessToken(user, permissions);
            await refreshTokenSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<TokenResponseDTO>.Success(new TokenResponseDTO { AccessToken = accessToken , RefreshToken = newRawToken, UserId = user.Id });

        }
    }
}
