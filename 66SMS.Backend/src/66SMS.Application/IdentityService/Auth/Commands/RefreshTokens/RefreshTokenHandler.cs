using _66SMS.Application.DTOs.Auth;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Constants;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Settings;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.IdentityService.Auth.Commands.RefreshTokens
{
    public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, Result<TokenResponseDTO>>
    {
        private readonly IRefreshTokenSqlRepository refreshTokenSqlRepository;
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IUserRoleSqlRepository userRoleSqlRepository;
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IJwtService jwtService;
        private readonly IOptions<JwtSettings> jwtOptions;

        public RefreshTokenHandler(
            IRefreshTokenSqlRepository refreshTokenSqlRepository,
            IUserSqlRepository userSqlRepository,
            IUserRoleSqlRepository userRoleSqlRepository,
            ICustomerSqlRepository customerSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            IJwtService jwtService,
            IOptions<JwtSettings> jwtOptions)
        {
            this.refreshTokenSqlRepository = refreshTokenSqlRepository;
            this.userSqlRepository = userSqlRepository;
            this.userRoleSqlRepository = userRoleSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.jwtService = jwtService;
            this.jwtOptions = jwtOptions;
        }

        public async Task<Result<TokenResponseDTO>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            // Token lấy từ body hoặc cookie (controller merge). Rỗng = chưa đăng nhập / cookie mất.
            if (string.IsNullOrWhiteSpace(request.Token))
                return Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_INVALID_TOKEN, ErrorCodes.ERR_AUTH_TOKEN_INVALID);

            var stored = await refreshTokenSqlRepository
                .AsQueryable(asNoTracking: false)
                .Where(x => x.Token.Equals(request.Token))
                .FirstOrDefaultAsync(cancellationToken);

            if (stored == null)
                return Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_INVALID_TOKEN, ErrorCodes.ERR_AUTH_TOKEN_INVALID);

            if (stored.IsRevoked)
            {
                var allToken = await refreshTokenSqlRepository
                    .AsQueryable(asNoTracking: false)
                    .Where(x => x.UserId == stored.UserId)
                    .ToListAsync(cancellationToken);

                foreach (var token in allToken.Where(x => x.IsActive))
                {
                    token.IsRevoked = true;
                    token.RevokedAt = DateTimeHelper.UtcNow();
                    token.RevokedByIp = request.IpAddress;
                    refreshTokenSqlRepository.Update(token);
                }

                await refreshTokenSqlRepository.SaveChangeAsync(cancellationToken);
                return Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_TOKEN_REVOKED, ErrorCodes.ERR_AUTH_TOKEN_REVOKED);
            }

            if (stored.IsExpired)
                return Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_REFRESH_TOKEN_EXPIRED, ErrorCodes.ERR_AUTH_REFRESH_TOKEN_EXPIRED);

            var user = await userSqlRepository
                .AsQueryable(true)
                .Where(x => x.Id == stored.UserId)
                .Select(x => new User
                {
                    Id = x.Id,
                    Username = x.Username,
                    Email = x.Email,
                    Status = x.Status,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null || user.Status == UserConst.STATUS_LOCKED)
                return Result<TokenResponseDTO>.BadRequest(UserConst.MSG_USER_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);

            stored.IsRevoked = true;
            stored.RevokedAt = DateTimeHelper.UtcNow();
            stored.RevokedByIp = request.IpAddress;
            refreshTokenSqlRepository.Update(stored);

            var newRawToken = jwtService.GenerateRefreshToken();
            refreshTokenSqlRepository.Add(new RefreshToken
            {
                UserId = user.Id,
                Token = newRawToken,
                ExpiresAt = DateTimeHelper.UtcNow().AddDays(jwtOptions.Value.RefreshTokenExpiryDays),
                CreatedByIp = request.IpAddress ?? "",
                CreatedAt = DateTimeHelper.UtcNow(),
            });

            string? role = await userRoleSqlRepository
                .AsQueryable(false)
                .Where(x => x.UserId == user.Id && x.Role!.Status == (int)StatusActiveEnum.ACTIVED)
                .Select(x => x.Role!.Code)
                .FirstOrDefaultAsync(cancellationToken);

            if (role == null)
                return Result<TokenResponseDTO>.NotFound(UserConst.MSG_USER_NO_ROLE, ErrorCodes.ERR_AUTH_NO_ROLE);

            var permissions = await userRoleSqlRepository
                .AsQueryable(true)
                .Where(x => x.UserId == user.Id && x.Role!.Status == (int)StatusActiveEnum.ACTIVED)
                .SelectMany(x => x.Role!.RolePermissions!
                    .Where(y => y.Permission != null)
                    .Select(y => y.Permission!.Resource + ":" + y.Permission.Action))
                .Distinct()
                .ToListAsync(cancellationToken);

            var profile = await BuildProfileAsync(user, role, permissions, cancellationToken);
            var accessToken = jwtService.GenerateAccessToken(profile);

            await refreshTokenSqlRepository.SaveChangeAsync(cancellationToken);

            return Result<TokenResponseDTO>.Success(new TokenResponseDTO
            {
                UserId = user.Id,
                AccessToken = accessToken,
                RefreshToken = newRawToken,
                UserProfile = profile,
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
