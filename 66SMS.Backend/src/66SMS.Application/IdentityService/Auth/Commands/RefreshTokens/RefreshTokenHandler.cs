using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Settings;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Contracts.Enumerations;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace _66SMS.Application.IdentityService.Auth.Commands.RefreshTokens
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
            RefreshToken? stored = await refreshTokenSqlRepository.AsQueryable(asNoTracking: false)
                .Where(x => x.Token.Equals(request.Token))
                .FirstOrDefaultAsync(cancellationToken);

            if (stored == null)
                return Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_INVALID_TOKEN, ErrorCodes.ERR_AUTH_TOKEN_INVALID);

            // Phat hien reuse attack
            if (stored.IsRevoked)
            {
                IReadOnlyList<RefreshToken>? allToken = await refreshTokenSqlRepository.AsQueryable(asNoTracking: false).Where(x => x.UserId.Equals(stored.Id)).ToListAsync(cancellationToken);
                foreach (var token in allToken.Where(x => x.IsActive))
                {
                    token.IsRevoked = true;
                    token.RevokedAt = DateTime.UtcNow;
                    token.RevokedByIp = request.IpAddress;
                    refreshTokenSqlRepository.Update(token);
                }

                await refreshTokenSqlRepository.SaveChangeAsync(cancellationToken);
                return Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_TOKEN_REVOKED, ErrorCodes.ERR_AUTH_TOKEN_REVOKED);
            }

            // kiem tra neu token con han khong
            if (stored.IsExpired)
                return Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_REFRESH_TOKEN_EXPIRED, ErrorCodes.ERR_AUTH_REFRESH_TOKEN_EXPIRED);

            // Kiem tra user co hop le
            User? user = await userSqlRepository.AsQueryable(asNoTracking: false)
               .AsQueryable()
               .Where(x => x.Id == stored.UserId)
               .Include(x => x.UserRoles!)
                   .ThenInclude(ur => ur.Role)
                       .ThenInclude(r => r!.RolePermissions)
                           .ThenInclude(rp => rp.Permission)
               .FirstOrDefaultAsync(cancellationToken);

            if (user == null || user.Status == UserConst.STATUS_LOCKED)
                return Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);

            // Rotate token
            stored.IsRevoked = true;
            stored.RevokedAt = DateTime.UtcNow;
            stored.RevokedByIp = request.IpAddress;
            refreshTokenSqlRepository.Update(stored);

            string newRawToken = jwtService.GenerateRefreshToken();
            // create new token
            RefreshToken newRefreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = newRawToken,
                ExpiresAt = DateTime.UtcNow.AddDays(jwtOptions.Value.RefreshTokenExpiryDays),
                CreatedByIp = request.IpAddress ?? "",
            };
            refreshTokenSqlRepository.Add(newRefreshToken);

            if (user.UserRoles == null || !user.UserRoles.Any())
                return Result<TokenResponseDTO>.NotFound(UserConst.MSG_USER_NO_ROLE, ErrorCodes.ERR_AUTH_NO_ROLE);
            
            var roleEntity = user.UserRoles.First().Role!;
            string role = roleEntity.Name;
            List<string> permissions = roleEntity.RolePermissions?
                .Where(rp => rp.Permission != null)
                .Select(rp => rp.Permission!.PermissionKey)
                .Distinct()
                .ToList() ?? new List<string>();

            string accessToken = jwtService.GenerateAccessToken(user, role, permissions);
            await refreshTokenSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<TokenResponseDTO>.Success(new TokenResponseDTO { AccessToken = accessToken , RefreshToken = newRawToken, UserId = user.Id });
        }
    }
}
