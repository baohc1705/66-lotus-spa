using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Commands.CreateTreatmentCourse
{
    public record CreateTreatmentCourseCommand : IRequest<Result<int>>
    {
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
        public int? Status { get; set; } = TreatmentCourseConst.STATUS_ACTIVED;
        public List<CreateTreatmentCourseItemDto>? Items { get; set; }

        [JsonIgnore]
        public int? CreatedBy { get; set; }
        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeHelper.UtcNow();
    }

    public class CreateTreatmentCourseItemDto
    {
        public int? ServiceId { get; set; }
        public int? SessionNumber { get; set; }
        public int? Quantity { get; set; } = 1;
        public string? Note { get; set; }
        public int? Status { get; set; } = TreatmentCourseConst.STATUS_ACTIVED;
    }
}
