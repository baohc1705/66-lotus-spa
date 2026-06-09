using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace _66SMS.Infrastructure.Security
{
    public class JwtService(IOptions<JwtSettings> options, IHttpContextAccessor httpContextAccessor) : IJwtService
    {
        public string GenerateAccessToken<TEntity>(TEntity entity, string role, List<string> permissions)
        {
            // Create claim
            var claims = new List<Claim>();
            // Get user id
            var type = typeof(TEntity);
            var idProp = type.GetProperty("Id");
            if (idProp != null)
                claims.Add(new Claim(ClaimTypes.NameIdentifier, idProp.GetValue(entity)?.ToString() ?? ""));
            // Add role
            claims.Add(new Claim(ClaimTypes.Role, role));
            
            // Add permissions
            foreach (var permission in permissions)
            {
                claims.Add(new Claim("permission", permission));
            }

            // Create key and cred
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Value.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            // create token
            var token = new JwtSecurityToken(
                issuer: options.Value.Issuer,
                audience: options.Value.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(options.Value.AccessTokenExpiryMinutes),
                signingCredentials: credentials);
            // Tra ve token
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            return GenerateTokenHelper.Generate();
        }

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
        public int GetUserId() => GetClaim<int>(ClaimTypes.NameIdentifier);

        public ClaimsPrincipal? ValidateToken(string token)
        {
            throw new NotImplementedException();
        }
    }
}
