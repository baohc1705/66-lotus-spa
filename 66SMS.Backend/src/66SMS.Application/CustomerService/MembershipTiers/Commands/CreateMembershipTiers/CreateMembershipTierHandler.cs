using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.CustomerService.MembershipTiers.Commands.CreateMembershipTiers
{
    public class CreateMembershipTierHandler : IRequestHandler<CreateMembershipTierCommand, Result<int>>
    {
        private readonly IMembershipTierSqlRepository membershipTierSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateMembershipTierHandler(
            IMembershipTierSqlRepository membershipTierSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.membershipTierSqlRepository = membershipTierSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<int>> Handle(CreateMembershipTierCommand request, CancellationToken cancellationToken)
        {
            try
            {
                MembershipTier membershipTier = mapper.Map<MembershipTier>(request);
                membershipTier.CreatedAt = DateTime.UtcNow;
                membershipTier.CreatedBy = request.CreatedBy ?? 1;

                membershipTierSqlRepository.Add(membershipTier);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                return Result<int>.Success(membershipTier.Id);
            }
            catch (Exception ex)
            {
                return Result<int>.Failure(500, $"An error occurred while creating membership tier: {ex.Message}");
            }
        }
    }
}
