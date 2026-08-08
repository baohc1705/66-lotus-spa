using System.Text.Json.Serialization;
using _66SMS.Contract.Shared;
using MediatR;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.CatalogService.Services.Commands.DeleteServices
{
    /// <summary>
    /// Delete service request
    /// </summary>
    public class DeleteServiceCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeHelper.UtcNow();
    }
}
