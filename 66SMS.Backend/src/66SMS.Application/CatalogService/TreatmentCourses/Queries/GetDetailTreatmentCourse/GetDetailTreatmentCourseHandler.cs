using _66SMS.Application.DTOs.TreatmentCourses;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Queries.GetDetailTreatmentCourse
{
    public class GetDetailTreatmentCourseHandler : IRequestHandler<GetDetailTreatmentCourseQuery, Result<TreatmentCourseDTO>>
    {
        private readonly ITreatmentCourseSqlRepository treatmentCourseRepository;

        public GetDetailTreatmentCourseHandler(ITreatmentCourseSqlRepository treatmentCourseRepository)
        {
            this.treatmentCourseRepository = treatmentCourseRepository;
        }

        public async Task<Result<TreatmentCourseDTO>> Handle(GetDetailTreatmentCourseQuery request, CancellationToken cancellationToken)
        {
            var course = await treatmentCourseRepository
                .AsQueryable()
                .Where(x => x.Id == request.Id && x.Status != TreatmentCourseConst.STATUS_DELETED)
                .Select(x => new TreatmentCourseDTO
                {
                    Id = x.Id,
                    CategoryId = x.CategoryId,
                    CategoryName = x.Category != null ? x.Category.Name : null,
                    Code = x.Code,
                    Name = x.Name,
                    Description = x.Description,
                    Content = x.Content,
                    TotalSessions = x.TotalSessions,
                    OriginalPrice = x.OriginalPrice,
                    SellingPrice = x.SellingPrice,
                    ImageUrl = x.ImageUrl,
                    SortOrder = x.SortOrder,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt.ToString(),
                    Items = x.Items != null ? x.Items.Select(i => new TreatmentCourseItemDTO
                    {
                        Id = i.Id,
                        TreatmentCourseId = i.TreatmentCourseId,
                        ServiceId = i.ServiceId,
                        ServiceName = i.Service != null ? i.Service.Name : null,
                        SessionNumber = i.SessionNumber,
                        Quantity = i.Quantity,
                        Note = i.Note,
                        Status = i.Status,
                    }).ToList() : null,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (course == null)
                return Result<TreatmentCourseDTO>.NotFound(TreatmentCourseConst.MSG_NOT_FOUND, ErrorCodes.ERR_TREATMENT_COURSE_NOT_FOUND);

            return Result<TreatmentCourseDTO>.Success(course);
        }
    }
}
