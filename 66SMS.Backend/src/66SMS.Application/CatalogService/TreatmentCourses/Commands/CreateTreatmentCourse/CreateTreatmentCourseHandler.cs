using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Commands.CreateTreatmentCourse
{
    public class CreateTreatmentCourseHandler : IRequestHandler<CreateTreatmentCourseCommand, Result<int>>
    {
        private readonly ITreatmentCourseSqlRepository treatmentCourseRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        private readonly IImageUploadService imageUploadService;

        public CreateTreatmentCourseHandler(
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

        public async Task<Result<int>> Handle(CreateTreatmentCourseCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                request.ImageUrl = null;

            var treatmentCourse = mapper.Map<TreatmentCourse>(request);
            if (request.Items != null && request.Items.Count > 0)
            {
                treatmentCourse.Items = request.Items?.Select(x => mapper.Map<TreatmentCourseItem>(x)).ToList();
                treatmentCourse.TotalSessions = treatmentCourse.Items!.Count;
            }
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                treatmentCourseRepository.Add(treatmentCourse);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.ImageBase64))
                {
                    treatmentCourse.ImageUrl = await imageUploadService.UploadAsync(
                        request.ImageBase64,
                        TreatmentCourseConst.GenerateImageFileName(treatmentCourse.Id),
                        TreatmentCourseConst.IMAGE_FOLDER,
                        cancellationToken);

                    if (!string.IsNullOrWhiteSpace(treatmentCourse.ImageUrl))
                    {
                        treatmentCourseRepository.Update(treatmentCourse);
                        await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    }
                }

                transaction.Commit();
                return Result<int>.Created(treatmentCourse.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
