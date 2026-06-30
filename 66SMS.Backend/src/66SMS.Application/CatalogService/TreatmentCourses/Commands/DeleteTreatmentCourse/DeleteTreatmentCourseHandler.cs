using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using System.Data;

namespace _66SMS.Application.CatalogService.TreatmentCourses.Commands.DeleteTreatmentCourse
{
    public class DeleteTreatmentCourseHandler : IRequestHandler<DeleteTreatmentCourseCommand, Result<object>>
    {
        private readonly ITreatmentCourseSqlRepository treatmentCourseRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteTreatmentCourseHandler(ITreatmentCourseSqlRepository treatmentCourseRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.treatmentCourseRepository = treatmentCourseRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteTreatmentCourseCommand request, CancellationToken cancellationToken)
        {
            var course = await treatmentCourseRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);

            if (course == null)
                return Result<object>.NotFound(TreatmentCourseConst.MSG_ID_NOT_FOUND, ErrorCodes.ERR_TREATMENT_COURSE_NOT_FOUND);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                course.Status = TreatmentCourseConst.STATUS_DELETED;
                course.UpdatedAt = DateTime.UtcNow;
                course.UpdatedBy = request.UpdatedBy;
                foreach(var item in course.Items!)
                {
                    item.Status = TreatmentCourseItemConst.STATUS_DELETED;
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
