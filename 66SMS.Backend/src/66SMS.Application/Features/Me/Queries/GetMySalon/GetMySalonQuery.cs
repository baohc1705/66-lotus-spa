using _66SMS.Application.DTOs.Salons;
using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.Me.Queries.GetMySalon
{
    public class GetMySalonQuery : IRequest<Result<SalonDto>>
    {
        [JsonIgnore]
        public int? SalonId { get; set; }
    }
}
