using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.IdentityService.Users.Commands.UpdateUser
{
    /// <summary>
    /// Handler for <see cref="UpdateUserCommand"/>
    /// </summary>
    public class UpdateUserHandler : IRequestHandler<UpdateUserCommand, Result<object>>
    {
        private readonly IUserSqlRepository userSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;
        public UpdateUserHandler(IUserSqlRepository userSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.userSqlRepository = userSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            // Find user with id provied
            User? user = await userSqlRepository.FindByIdAsync((int)request.Id!, false, cancellationToken);

            // return not found if user is null
            if (user is null)
                return Result<object>.NotFound(UserConst.MSG_USER_ID_NOT_FOUND, ErrorCodes.ERR_USER_NOT_FOUND);

            // Map ignore null
            mapper.Map(request, user);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Update and persist to database
                userSqlRepository.Update(user);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Commit transaction
                transaction.Commit();

                // return success result
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
