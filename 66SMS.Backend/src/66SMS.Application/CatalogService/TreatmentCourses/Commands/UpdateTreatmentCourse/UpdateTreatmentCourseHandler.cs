using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Commands.UpdateTreatmentCourse
{
    public class UpdateTreatmentCourseHandler : IRequestHandler<UpdateTreatmentCourseCommand, Result<object>>
    {
        private readonly ITreatmentCourseSqlRepository treatmentCourseRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public UpdateTreatmentCourseHandler(
            ITreatmentCourseSqlRepository treatmentCourseRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper,
            IImageUploadService imageUploadService)
        {
            this.treatmentCourseRepository = treatmentCourseRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
            this.imageUploadService = imageUploadService;
        }

        public async Task<Result<object>> Handle(UpdateTreatmentCourseCommand request, CancellationToken cancellationToken)
        {
            var course = await treatmentCourseRepository
                .AsQueryable(false)
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (course == null)
                return Result<object>.NotFound(TreatmentCourseConst.MSG_NOT_FOUND, ErrorCodes.ERR_TREATMENT_COURSE_NOT_FOUND);

            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.ImageUrl = null;

            mapper.Map(request, course);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (request.Items != null)
                {
                    course.Items?.Clear();
                    var newItems = request.Items.Select(x => mapper.Map<TreatmentCourseItem>(x)).ToList();
                    course.Items = newItems;
                    course.TotalSessions = newItems.Count;
                }

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    var url = await imageUploadService.UploadAsync(
                        request.ImageBase64,
                        TreatmentCourseConst.GenerateImageFileName(course.Id),
                        TreatmentCourseConst.IMAGE_FOLDER,
                        cancellationToken);

                    if (!string.IsNullOrWhiteSpace(url))
                        course.ImageUrl = url;
                }

                treatmentCourseRepository.Update(course);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
