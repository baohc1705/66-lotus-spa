using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Commands.UpdateTreatmentCourse
{
    public class UpdateTreatmentCourseCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public int? CategoryId { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public decimal? OriginalPrice { get; set; }
        public decimal? SellingPrice { get; set; }
        public string? ImageUrl { get; set; }
        /// <summary>Base64 ảnh mới — upload qua IImageUploadService.</summary>
        public string? ImageBase64 { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        public List<UpdateTreatmentCourseItemDto>? Items { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeHelper.UtcNow();
    }

    public class UpdateTreatmentCourseItemDto
    {
        public int? ServiceId { get; set; }
        public int? SessionNumber { get; set; }
        public int? Quantity { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
    }
}
