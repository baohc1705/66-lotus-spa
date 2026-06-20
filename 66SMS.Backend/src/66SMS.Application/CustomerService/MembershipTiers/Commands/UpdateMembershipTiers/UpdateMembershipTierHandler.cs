using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.CustomerService.MembershipTiers.Commands.UpdateMembershipTiers
{
    public class UpdateMembershipTierHandler : IRequestHandler<UpdateMembershipTierCommand, Result<object>>
    {
        private readonly IMembershipTierSqlRepository membershipTierSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateMembershipTierHandler(
            IMembershipTierSqlRepository membershipTierSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.membershipTierSqlRepository = membershipTierSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateMembershipTierCommand request, CancellationToken cancellationToken)
        {
            MembershipTier? membershipTier = await membershipTierSqlRepository.FindByIdAsync(request.Id);
            if (membershipTier == null)
            {
                return Result<object>.NotFound(MembershipTierConst.MSG_MEMBERSHIP_TIER_NOT_FOUND, ErrorCodes.ERR_MEMBERSHIP_TIER_NOT_FOUND);
            }

            mapper.Map(request, membershipTier);
            membershipTier.UpdatedAt = DateTime.UtcNow;

            membershipTierSqlRepository.Update(membershipTier);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
