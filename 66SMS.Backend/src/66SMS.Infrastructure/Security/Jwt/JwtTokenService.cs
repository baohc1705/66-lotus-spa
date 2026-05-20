using _66SMS.Application.Abstractions.Security;
using _66SMS.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Runtime;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace _66SMS.Infrastructure.Security.Jwt
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly JwtSettings settings;

        public JwtTokenService(IOptions<JwtSettings> options)
        {
            this.settings = options.Value;
        }

        public string GenerateAccessToken(User user, IList<string> permissons)
        {
            // Tao claim (body jwt)
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.UserName),
                new(ClaimTypes.Email, user.Email),
                new("permissions",JsonConvert.SerializeObject(permissons))
            };

            // Tao key
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.SecretKey));

            // Tao chu ky Credentials
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Tao token

            var token = new JwtSecurityToken(
                issuer: settings.Issuer,
                audience: settings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(settings.AccessTokenExpirationMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
            => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
}
