using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.IdentityService.Users.Queries.GetMySalon
{
    public class GetMySalonQuery : IRequest<Result<SalonDto>>
    {
        [JsonIgnore]
        public int? SalonId { get; set; }
    }
}
