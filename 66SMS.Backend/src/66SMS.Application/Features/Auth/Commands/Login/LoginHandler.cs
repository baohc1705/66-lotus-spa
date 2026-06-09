using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Settings;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace _66SMS.Application.Features.Auth.Commands.Login
{
    public class LoginHandler : IRequestHandler<LoginCommand, Result<TokenResponseDTO>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly IRefreshTokenSqlRepository refreshTokenSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IPasswordHash passwordHash;
        private readonly IOptions<JwtSettings> jwtOptions;
        private readonly IJwtService jwtService;

        public LoginHandler(IUserSqlRepository userSqlRepository, IPasswordHash passwordHash, IOptions<JwtSettings> jwtOptions, IJwtService jwtService, IRefreshTokenSqlRepository refreshTokenSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IUserRoleSqlRepository userRoleSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.passwordHash = passwordHash;
            this.jwtOptions = jwtOptions;
            this.jwtService = jwtService;
            this.refreshTokenSqlRepository = refreshTokenSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.userRoleSqlRepository = userRoleSqlRepository;
        }

        public async Task<Result<TokenResponseDTO>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            // Validate user with username and email 
            var userExisted = await userSqlRepository.AsQueryable(asNoTracking: false)
                .Where(x => x.Username.Equals(request.UsernameOrEmail) || x.Email.Equals(request.UsernameOrEmail))
                .FirstOrDefaultAsync(cancellationToken);

            if (userExisted == null)
                return Result<TokenResponseDTO>.BadRequest("Username or email wrong");

            // Check lock account
            if (userExisted.Status == UserStatus.LOCKED)
                return Result<TokenResponseDTO>.BadRequest($"Account is locked. Try again after {userExisted.LogoutEnd:HH:mm dd/MM/yyyy}");

            // Check password
            if (!passwordHash.Verify(userExisted.PasswordHash, request.Password))
            {
                // Increment faild login
                userExisted.AccessFailedCount++;

                // Lock if greater than max failed attempts
                if (userExisted.AccessFailedCount >= jwtOptions.Value.MaxFailedAttempts)
                {
                    userExisted.Status = UserStatus.LOCKED;
                    userExisted.LogoutEnd = DateTime.UtcNow.AddMinutes(jwtOptions.Value.AccessTokenExpiryMinutes);
                }
                userSqlRepository.Update(userExisted);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                return userExisted.Status == UserStatus.LOCKED
                    ? Result<TokenResponseDTO>.BadRequest("Account has been block because login many time")
                    : Result<TokenResponseDTO>.BadRequest("Password wrong");
            }
            // Reset failed access and unclock account if login success
            userExisted.AccessFailedCount = 0;
            userExisted.Status = UserStatus.ACTIVE;
            userExisted.LogoutEnd = null;
            userExisted.LastLoginAt = DateTime.UtcNow;
            userSqlRepository.Update(userExisted);

            // Get role and list permission then add to jwt
            Role? role = await userRoleSqlRepository.GetRoleByUserIdAsync(userExisted.Id, cancellationToken);
            if (role == null)
                return Result<TokenResponseDTO>.NotFound("Account has no role");

            List<string> permissions = await userRoleSqlRepository.GetPermissionKeysByUserIdAndRoleIdAsync(
                userExisted.Id, 
                role.Id, 
                cancellationToken) ?? new List<string>();

            // Generate token 
            var accessToken = jwtService.GenerateAccessToken(userExisted, role.Name, permissions);
            var rawRefreshToken = jwtService.GenerateRefreshToken();

            // Add refresh token in db
            var refreshToken = new RefreshToken
            {
                UserId = userExisted.Id,
                Token = rawRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(jwtOptions.Value.RefreshTokenExpiryDays),
                CreatedByIp = request.IpAddress ?? "",
            };

            refreshTokenSqlRepository.Add(refreshToken);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
            return Result<TokenResponseDTO>.Success(new TokenResponseDTO { UserId = userExisted.Id, AccessToken = accessToken, RefreshToken = refreshToken.Token });
        }

    }
}
