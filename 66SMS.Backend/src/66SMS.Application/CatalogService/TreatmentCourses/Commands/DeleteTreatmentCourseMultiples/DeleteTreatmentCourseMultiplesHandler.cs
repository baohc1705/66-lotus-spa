using MediatR;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Contract.Enumerations;
using Microsoft.EntityFrameworkCore;
using _66SMS.Domain.Enums;
using System.Data;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Commands.DeleteTreatmentCourseMultiples
{
    public class DeleteTreatmentCourseMultiplesHandler : IRequestHandler<DeleteTreatmentCourseMultiplesCommand, Result<object>>
    {
        private readonly ITreatmentCourseSqlRepository treatmentCourseSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteTreatmentCourseMultiplesHandler(ITreatmentCourseSqlRepository treatmentCourseSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.treatmentCourseSqlRepository = treatmentCourseSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteTreatmentCourseMultiplesCommand request, CancellationToken cancellationToken)
        {
            var requestIds = request.Ids.Distinct().ToList();
            var existingCourses = await treatmentCourseSqlRepository
                .AsQueryable(false)
                .Where(x => requestIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            var existingIds = existingCourses.Select(x => x.Id).ToHashSet();
            if (existingIds.Count != requestIds.Count)
            {
                return Result<object>.NotFound(TreatmentCourseConst.MSG_NOT_FOUND, ErrorCodes.ERR_TREATMENT_COURSE_NOT_FOUND);
            }

            var now = DateTimeHelper.UtcNow();
            foreach (var course in existingCourses)
            {
                course.Status = (int)StatusActiveEnum.DELETED;
                treatmentCourseSqlRepository.Update(course);
            }

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<object>.Ok();
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
