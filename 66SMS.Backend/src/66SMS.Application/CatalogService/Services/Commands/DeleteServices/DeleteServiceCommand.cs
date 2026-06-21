using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.Services.Commands.DeleteServices
{
    /// <summary>
    /// Delete service request
    /// </summary>
    public class DeleteServiceCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
