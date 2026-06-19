using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Settings;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
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
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IPasswordHash passwordHash;
        private readonly IOptions<JwtSettings> jwtOptions;
        private readonly IJwtService jwtService;

        public LoginHandler(IUserSqlRepository userSqlRepository, IPasswordHash passwordHash, IOptions<JwtSettings> jwtOptions, IJwtService jwtService, IRefreshTokenSqlRepository refreshTokenSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IUserRoleSqlRepository userRoleSqlRepository, IStaffSalonSqlRepository staffSalonSqlRepository, IStaffSqlRepository staffSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.passwordHash = passwordHash;
            this.jwtOptions = jwtOptions;
            this.jwtService = jwtService;
            this.refreshTokenSqlRepository = refreshTokenSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.userRoleSqlRepository = userRoleSqlRepository;
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
        }

        public async Task<Result<TokenResponseDTO>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            // Validate user with username and email 
            var userExisted = await userSqlRepository.AsQueryable(asNoTracking: false)
                .Where(x => x.Username.Equals(request.UsernameOrEmail) || x.Email.Equals(request.UsernameOrEmail))
                .FirstOrDefaultAsync(cancellationToken);

            if (userExisted == null)
                return Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_INVALID_CREDENTIALS);

            // Check lock account
            if (userExisted.Status == UserConst.STATUS_LOCKED)
                return Result<TokenResponseDTO>.BadRequest($"Account is locked. Try again after {userExisted.LockoutEnd:HH:mm dd/MM/yyyy}");

            // Check password
            if (!passwordHash.Verify(userExisted.PasswordHash, request.Password))
            {
                // Increment faild login
                userExisted.AccessFailedCount++;

                // Lock if greater than max failed attempts
                if (userExisted.AccessFailedCount >= jwtOptions.Value.MaxFailedAttempts)
                {
                    userExisted.Status = UserConst.STATUS_LOCKED;
                    userExisted.LockoutEnd = DateTime.UtcNow.AddMinutes(jwtOptions.Value.AccessTokenExpiryMinutes);
                }
                userSqlRepository.Update(userExisted);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                return userExisted.Status == UserConst.STATUS_LOCKED
                    ? Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_ACCOUNT_LOCKED, ErrorCodes.ERR_AUTH_ACCOUNT_LOCKED)
                    : Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_WRONG_PASSWORD);
            }
            // Reset failed access and unclock account if login success
            userExisted.AccessFailedCount = 0;
            userExisted.Status = UserConst.STATUS_ACTIVED;
            userExisted.LockoutEnd = null;
            userExisted.LastLoginAt = DateTime.UtcNow;
            userSqlRepository.Update(userExisted);

            // Get role and list permission then add to jwt
            Role? role = await userRoleSqlRepository.GetRoleByUserIdAsync(userExisted.Id, cancellationToken);
            if (role == null)
                return Result<TokenResponseDTO>.NotFound(UserConst.MSG_USER_NO_ROLE, ErrorCodes.ERR_AUTH_NO_ROLE);

            List<string> permissions = await userRoleSqlRepository.GetPermissionKeysByUserIdAndRoleIdAsync(
                userExisted.Id, 
                role.Id, 
                cancellationToken) ?? new List<string>();

            // Check if user is a manager — get their salon_id from staff_salons
            int? managedSalonId = null;
            var staff = await staffSqlRepository.AsQueryable()
                .Where(x => x.UserId == userExisted.Id)
                .FirstOrDefaultAsync(cancellationToken);
            if (staff != null)
            {
                var staffSalon = await staffSalonSqlRepository.AsQueryable()
                    .Where(x => x.StaffId == staff.Id && x.IsManager == true && x.Status == StaffSalonConst.STATUS_ACTIVE)
                    .FirstOrDefaultAsync(cancellationToken);
                if (staffSalon != null)
                    managedSalonId = staffSalon.SalonId;
            }

            // Generate token
            var accessToken = jwtService.GenerateAccessToken(userExisted, role.Name, permissions, managedSalonId);
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
            return Result<TokenResponseDTO>.Success(new TokenResponseDTO { UserId = userExisted.Id, AccessToken = accessToken, RefreshToken = refreshToken.Token, ManagedSalonId = managedSalonId });
        }

    }
}
