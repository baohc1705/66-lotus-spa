using MediatR;
using _66SMS.Contract.Shared;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Commands.DeleteTreatmentCourseMultiples
{
    public class DeleteTreatmentCourseMultiplesCommand : IRequest<Result<object>>
    {
        public List<int> Ids { get; set; } = new();

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
