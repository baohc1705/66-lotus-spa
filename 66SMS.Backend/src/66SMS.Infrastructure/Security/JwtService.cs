using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace _66SMS.Infrastructure.Security
{
    public class JwtService(IOptions<JwtSettings> options, IHttpContextAccessor httpContextAccessor) : IJwtService
    {
        public string GenerateAccessToken<TEntity>(TEntity entity, IList<string> permissions)
        {
            // Create claim
            var claims = new List<Claim>();
            // Get info entity
            var type = typeof(TEntity);
            var idProp = type.GetProperty("Id");
            if (idProp != null)
                claims.Add(new Claim(ClaimTypes.NameIdentifier, idProp.GetValue(entity)?.ToString() ?? ""));
            var emailProp = type.GetProperty("Email");
            if (emailProp != null)
                claims.Add(new Claim(ClaimTypes.Email, emailProp.GetValue(entity)?.ToString() ?? ""));
            var usernameProp = type.GetProperty("Username");
            if (usernameProp != null)
                claims.Add(new Claim(ClaimTypes.Name, usernameProp.GetValue(entity)?.ToString() ?? ""));

            // Add permission
            claims.Add(new Claim("permissions", JsonConvert.SerializeObject(permissions)));

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
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
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
        public string GetUsername() => GetClaim<string>(ClaimTypes.Name);
        public string GetEmail() => GetClaim<string>(ClaimTypes.Email);

        public IList<string> GetPermissions()
        {
            var raw = GetClaim<string>("permissions");
            if (string.IsNullOrEmpty(raw)) return [];
            return JsonConvert.DeserializeObject<IList<string>>(raw) ?? [];
        }
        public ClaimsPrincipal? ValidateToken(string token)
        {
            throw new NotImplementedException();
        }
    }
}
