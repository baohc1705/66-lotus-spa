using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Settings;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace _66SMS.Application.IdentityService.Auth.Commands.Login
{
    public class LoginHandler : IRequestHandler<LoginCommand, Result<TokenResponseDTO>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly IRefreshTokenSqlRepository refreshTokenSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IPasswordHash passwordHash;
        private readonly IOptions<JwtSettings> jwtOptions;
        private readonly IJwtService jwtService;

        public LoginHandler(
            IUserSqlRepository userSqlRepository,
            IPasswordHash passwordHash,
            IOptions<JwtSettings> jwtOptions,
            IJwtService jwtService,
            IRefreshTokenSqlRepository refreshTokenSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IUserRoleSqlRepository userRoleSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ICustomerSqlRepository customerSqlRepository)
        {
            this.userSqlRepository = userSqlRepository;
            this.passwordHash = passwordHash;
            this.jwtOptions = jwtOptions;
            this.jwtService = jwtService;
            this.refreshTokenSqlRepository = refreshTokenSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.userRoleSqlRepository = userRoleSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
        }

        public async Task<Result<TokenResponseDTO>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var userExisted = await userSqlRepository
                .AsQueryable(false)
                .Where(x => x.Username.Equals(request.UsernameOrEmail) || x.Email.Equals(request.UsernameOrEmail))
                .FirstOrDefaultAsync(cancellationToken);

            if (userExisted == null)
                return Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_INVALID_CREDENTIALS, ErrorCodes.ERR_AUTH_INVALID_CREDENTIALS);

            if (userExisted.Status == UserConst.STATUS_LOCKED)
                return Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_LOCKOUT_TIMEOUT, ErrorCodes.ERR_AUTH_ACCOUNT_LOCKED);

            if (!passwordHash.Verify(userExisted.PasswordHash, request.Password))
            {
                userExisted.AccessFailedCount++;

                if (userExisted.AccessFailedCount >= jwtOptions.Value.MaxFailedAttempts)
                {
                    userExisted.Status = (int)StatusActiveEnum.IACTIVED;
                    userExisted.LockoutEnd = DateTime.UtcNow.AddMinutes(jwtOptions.Value.AccessTokenExpiryMinutes);
                }

                userSqlRepository.Update(userExisted);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                return userExisted.Status == (int)StatusActiveEnum.IACTIVED
                    ? Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_ACCOUNT_LOCKED, ErrorCodes.ERR_AUTH_ACCOUNT_LOCKED)
                    : Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_WRONG_PASSWORD, ErrorCodes.ERR_AUTH_INVALID_CREDENTIALS);
            }

            userExisted.AccessFailedCount = 0;
            userExisted.Status = (int)StatusActiveEnum.ACTIVED;
            userExisted.LockoutEnd = null;
            userExisted.LastLoginAt = DateTime.UtcNow;
            userSqlRepository.Update(userExisted);

            string? role = await userRoleSqlRepository
                .AsQueryable(false)
                .Where(x => x.UserId == userExisted.Id && x.Role!.Status == (int)StatusActiveEnum.ACTIVED)
                .Select(x => x.Role!.Code)
                .FirstOrDefaultAsync(cancellationToken);

            if (role == null)
                return Result<TokenResponseDTO>.NotFound(UserConst.MSG_USER_NO_ROLE, ErrorCodes.ERR_AUTH_NO_ROLE);

            var permissions = await userRoleSqlRepository
                .AsQueryable(true)
                .Where(x => x.UserId == userExisted.Id && x.Role!.Status == (int)StatusActiveEnum.ACTIVED)
                .SelectMany(x => x.Role!.RolePermissions!
                    .Where(y => y.Permission != null)
                    .Select(y => y.Permission!.Resource + ":" + y.Permission.Action))
                .Distinct()
                .ToListAsync(cancellationToken);

            var profile = await BuildProfileAsync(userExisted, role, permissions, cancellationToken);

            var accessToken = jwtService.GenerateAccessToken(profile);
            var rawRefreshToken = jwtService.GenerateRefreshToken();

            refreshTokenSqlRepository.Add(new RefreshToken
            {
                UserId = userExisted.Id,
                Token = rawRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(jwtOptions.Value.RefreshTokenExpiryDays),
                CreatedByIp = request.IpAddress ?? "",
                CreatedAt = DateTime.UtcNow,
            });

            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<TokenResponseDTO>.Success(new TokenResponseDTO
            {
                UserId = userExisted.Id,
                AccessToken = accessToken,
                RefreshToken = rawRefreshToken,
                UserProfile = profile
            });
        }

        private async Task<TokenUserProfileDto> BuildProfileAsync(
            User user,
            string role,
            List<string> permissions,
            CancellationToken cancellationToken)
        {
            var profile = new TokenUserProfileDto
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                Roles = new List<string> { role },
                Permissions = permissions,
                ProfileType = role == RoleConst.CODE_CUSTOMER
                    ? JwtClaimConst.ProfileTypeCustomer
                    : JwtClaimConst.ProfileTypeStaff,
            };

            if (role == RoleConst.CODE_CUSTOMER)
            {
                var customer = await customerSqlRepository
                    .AsQueryable(true)
                    .Where(x => x.UserId == user.Id)
                    .Select(x => new Customer
                    {
                        Id = x.Id,
                        FullName = x.FullName,
                        Phone = x.Phone,
                        AvatarUrl = x.AvatarUrl,
                        LoyaltyPoint = x.LoyaltyPoint,
                    })
                    .FirstOrDefaultAsync(cancellationToken);

                profile.FullName = customer?.FullName;
                profile.Phone = customer?.Phone;
                profile.AvatarUrl = customer?.AvatarUrl;
                profile.CustomerProfile = customer != null
                    ? new TokenCustomerProfileDto
                    {
                        CustomerId = customer.Id,
                        LoyaltyPoint = customer.LoyaltyPoint,
                    }
                    : null;
            }
            else
            {
                // staff / manager / admin (nếu có bản ghi staff) — lấy SalonId cho token
                var staff = await staffSqlRepository
                    .AsQueryable(true)
                    .Where(x => x.UserId == user.Id)
                    .Select(x => new Staff
                    {
                        Id = x.Id,
                        Code = x.Code,
                        FullName = x.FullName,
                        Phone = x.Phone,
                        AvatarUrl = x.AvatarUrl,
                        StaffSalons = x.StaffSalons!
                            .Where(y => y.Status == StaffSalonConst.STATUS_ACTIVE)
                            .Select(y => new StaffSalon { SalonId = y.SalonId })
                            .ToList(),
                    })
                    .FirstOrDefaultAsync(cancellationToken);

                if (staff != null)
                {
                    profile.FullName = staff.FullName;
                    profile.Phone = staff.Phone;
                    profile.AvatarUrl = staff.AvatarUrl;
                    profile.StaffProfile = new TokenStaffProfileDto
                    {
                        StaffId = staff.Id,
                        Code = staff.Code,
                        SalonId = staff.StaffSalons!
                            .Select(x => (int?)x.SalonId)
                            .FirstOrDefault(),
                    };
                }
                else if (role == RoleConst.CODE_ADMIN)
                {
                    profile.ProfileType = JwtClaimConst.ProfileTypeNone;
                }
            }

            return profile;
        }
    }
}
