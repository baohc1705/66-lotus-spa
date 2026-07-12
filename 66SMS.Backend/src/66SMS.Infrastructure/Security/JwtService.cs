using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Settings;
using _66SMS.Contracts.Shared;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace _66SMS.Infrastructure.Security
{
    public class JwtService(IOptions<JwtSettings> options, IHttpContextAccessor httpContextAccessor) : IJwtService
    {
        private static readonly JsonSerializerSettings ProfileJsonSettings = new()
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            NullValueHandling = NullValueHandling.Ignore
        };

        public string GenerateAccessToken(TokenUserProfileDto profile)
        {
            var roleCode = profile.Roles.FirstOrDefault() ?? string.Empty;

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, profile.UserId.ToString()),
                new Claim(ClaimTypes.Role, roleCode),
                new Claim(JwtClaimConst.ProfileType, profile.ProfileType),
            };

            var profileJson = JsonConvert.SerializeObject(profile, ProfileJsonSettings);
            claims.Add(new Claim(JwtClaimConst.Profile, profileJson));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Value.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: options.Value.Issuer,
                audience: options.Value.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(options.Value.AccessTokenExpiryMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken() => GenerateTokenHelper.Generate();

        public TEntity? GetClaim<TEntity>(string claimType)
        {
            var claimValue = httpContextAccessor.HttpContext?.User?.FindFirstValue(claimType);
            if (claimValue == null) return default;
            try
            {
                return (TEntity)Convert.ChangeType(claimValue, typeof(TEntity));
            }
            catch
            {
                return default;
            }
        }

        public TokenUserProfileDto? GetProfile()
        {
            var profileJson = httpContextAccessor.HttpContext?.User?.FindFirstValue(JwtClaimConst.Profile);
            if (string.IsNullOrEmpty(profileJson)) return null;
            return JsonConvert.DeserializeObject<TokenUserProfileDto>(profileJson, ProfileJsonSettings);
        }

        public int GetUserId() => GetClaim<int>(ClaimTypes.NameIdentifier);

        public int? GetSalonId()
        {
            var salonId = GetProfile()?.StaffProfile?.SalonId;
            return salonId is > 0 ? salonId : null;
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(options.Value.SecretKey);
                var validationParams = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = options.Value.Issuer,
                    ValidateAudience = true,
                    ValidAudience = options.Value.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
                return tokenHandler.ValidateToken(token, validationParams, out _);
            }
            catch
            {
                return null;
            }
        }
    }
}
