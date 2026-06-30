using _66SMS.Contracts.Shared;
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

        public CreateTreatmentCourseHandler(ITreatmentCourseSqlRepository treatmentCourseRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.treatmentCourseRepository = treatmentCourseRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<int>> Handle(CreateTreatmentCourseCommand request, CancellationToken cancellationToken)
        {
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
