using _66SMS.Application.DTOs.Identity;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace _66SMS.Application.Features.Auth.Commands.Login
{
    public class LoginHandler : IRequestHandler<LoginCommand, Result<TokenResponseDTO>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IPermissionSqlRepository permissionSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly IRefreshTokenSqlRepository refreshTokenSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IPasswordHash passwordHash;
        private readonly IOptions<JwtSettings> jwtOptions;
        private readonly IJwtService jwtService;

        public LoginHandler(IUserSqlRepository userSqlRepository, IMapper mapper, IPasswordHash passwordHash, IOptions<JwtSettings> jwtOptions, IPermissionSqlRepository permissionSqlRepository, IJwtService jwtService, IRefreshTokenSqlRepository refreshTokenSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IUserRoleSqlRepository userRoleSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.mapper = mapper;
            this.passwordHash = passwordHash;
            this.jwtOptions = jwtOptions;
            this.permissionSqlRepository = permissionSqlRepository;
            this.jwtService = jwtService;
            this.refreshTokenSqlRepository = refreshTokenSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.userRoleSqlRepository = userRoleSqlRepository;
        }

        public async Task<Result<TokenResponseDTO>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            // Validate user with username and email 
            var userExisted = await userSqlRepository.FindSingleAsync(
                predicate: x => x.Username.Equals(request.UsernameOrEmail) || x.Email.Equals(request.UsernameOrEmail),
                asNoTracking: false,
                ct: cancellationToken);
            if (userExisted == null)
                return Result<TokenResponseDTO>.BadRequest("Username or email wrong");
            // Check lock account
            if (userExisted.LogoutEnabled)
                return Result<TokenResponseDTO>.BadRequest($"Account is locked. Try again after {userExisted.LogoutEnd:HH:mm dd/MM/yyyy}");

            // Check password
            if (!passwordHash.Verify(userExisted.PasswordHash, request.Password))
            {
                // Increment faild login
                userExisted.AccessFailedCount++;

                // Lock if greater than max failed attempts
                if (userExisted.AccessFailedCount >= jwtOptions.Value.MaxFailedAttempts) 
                { 
                    userExisted.LogoutEnabled = true;
                    userExisted.LogoutEnd = DateTime.UtcNow.AddMinutes(jwtOptions.Value.AccessTokenExpiryMinutes);
                }
                userSqlRepository.Update(userExisted);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                return userExisted.LogoutEnabled
                    ? Result<TokenResponseDTO>.BadRequest("Account has been block because login many time")
                    : Result<TokenResponseDTO>.BadRequest("Password wrong");
            }
            // Reset failed access and unclock account if login success
            userExisted.AccessFailedCount = 0;
            userExisted.LogoutEnabled = false;
            userExisted.LogoutEnd = null;
            userExisted.LastLoginAt = DateTime.UtcNow;
            userSqlRepository.Update(userExisted);

            List<string> premissions = await userRoleSqlRepository
                 .FindAll( 
                    predicate: x => x.UserId == userExisted.Id,
                    includes: x => x
                    .Include(ur => ur.Role)
                        .ThenInclude(ur => ur.RolePermissions)
                           .ThenInclude(rp => rp.Permission))
                 .Where(ur => ur.Role.IsActived)
                 .SelectMany(ur => ur.Role.RolePermissions)
                 .Select(rp => rp.Permission.PermissionKey)
                 .Distinct()
                 .ToListAsync(cancellationToken);

            // Generate token
            var accessToken = jwtService.GenerateAccessToken(userExisted, premissions);
            var rawRefreshToken = jwtService.GenerateRefreshToken();

            // Add refresh token in db
            var refreshToken = new RefreshToken
            {
                UserId = userExisted.Id,
                Token = rawRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(jwtOptions.Value.RefreshTokenExpiryDays),
                CreatedByIp = request.IpAddress,
            };

            refreshTokenSqlRepository.Add(refreshToken);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<TokenResponseDTO>.Success(new TokenResponseDTO { UserId = userExisted.Id, AccessToken = accessToken, RefreshToken = refreshToken.Token });
        }

    }
}
