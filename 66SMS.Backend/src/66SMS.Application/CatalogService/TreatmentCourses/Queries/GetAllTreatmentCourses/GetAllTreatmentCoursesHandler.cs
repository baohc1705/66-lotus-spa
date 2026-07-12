using _66SMS.Application.DTOs.TreatmentCourses;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Queries.GetAllTreatmentCourses
{
    public class GetAllTreatmentCoursesHandler : IRequestHandler<GetAllTreatmentCoursesQuery, Result<PagedResult<TreatmentCourseDTO>>>
    {
        private readonly ITreatmentCourseSqlRepository treatmentCourseRepository;

        public GetAllTreatmentCoursesHandler(ITreatmentCourseSqlRepository treatmentCourseRepository)
        {
            this.treatmentCourseRepository = treatmentCourseRepository;
        }

        public async Task<Result<PagedResult<TreatmentCourseDTO>>> Handle(GetAllTreatmentCoursesQuery request, CancellationToken cancellationToken)
        {
            var query = treatmentCourseRepository.AsQueryable();

            if (request.IsDeleted)
            {
                query = query.Where(x => x.Status == (int)StatusActiveEnum.DELETED);
            }
            else
            {
                query = query.Where(x => x.Status != (int)StatusActiveEnum.DELETED);
            }

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.Name.Contains(request.Filter) || x.Code.Contains(request.Filter));
            }

            if (request.Status.HasValue)
            {
                query = query.Where(x => x.Status == request.Status);
            }

            query = request.OrderBy?.ToLower() switch
            {
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var result = await query
                .Select(x => new TreatmentCourseDTO
                {
                    Id = x.Id,
                    CategoryId = x.CategoryId,
                    CategoryName = x.Category != null ? x.Category.Name : null,
                    Code = x.Code,
                    Name = x.Name,
                    Description = x.Description,
                    TotalSessions = x.TotalSessions,
                    OriginalPrice = x.OriginalPrice,
                    SellingPrice = x.SellingPrice,
                    ImageUrl = x.ImageUrl,
                    SortOrder = x.SortOrder,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt.ToString()
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<TreatmentCourseDTO>>.Success(result);
        }
    }
}
