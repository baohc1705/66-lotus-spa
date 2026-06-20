using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.Features.MembershipCards.Commands.CreateMembershipCards
{
    public class CreateMembershipCardHandler : IRequestHandler<CreateMembershipCardCommand, Result<int>>
    {
        private readonly IMembershipCardSqlRepository membershipCardSqlRepository;
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IMembershipTierSqlRepository membershipTierSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateMembershipCardHandler(
            IMembershipCardSqlRepository membershipCardSqlRepository,
            ICustomerSqlRepository customerSqlRepository,
            IMembershipTierSqlRepository membershipTierSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.membershipCardSqlRepository = membershipCardSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
            this.membershipTierSqlRepository = membershipTierSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<int>> Handle(CreateMembershipCardCommand request, CancellationToken cancellationToken)
        {
            Customer? customer = await customerSqlRepository.FindByIdAsync(request.CustomerId);
            if (customer == null)
            {
                return Result<int>.NotFound(CustomerConst.MSG_CUSTOMER_NOT_FOUND, ErrorCodes.ERR_CUSTOMER_NOT_FOUND);
            }

            MembershipTier? tier = await membershipTierSqlRepository
               .AsQueryable()
               .Where(x => x.Id == request.MembershipTierId! || x.Name.Equals(request.MembershipTierName))
               .FirstOrDefaultAsync(cancellationToken);

            if (tier == null)
            {
                return Result<int>.NotFound(MembershipTierConst.MSG_MEMBERSHIP_TIER_NOT_FOUND, ErrorCodes.ERR_MEMBERSHIP_TIER_NOT_FOUND);
            }

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                MembershipCard membershipCard = mapper.Map<MembershipCard>(request);
                membershipCard.MembershipTierId = tier.Id;
                membershipCard.CardCode = GenerateCardCode();
                membershipCard.CreatedBy = request.CreatedBy ?? 1;

                membershipCardSqlRepository.Add(membershipCard);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                return Result<int>.Created(membershipCard.Id);
            }
            catch (Exception)
            {
                transaction.Rollback();
                throw;
            }
        }

        private string GenerateCardCode()
        {
            string random = Random.Shared.Next(100000,999999).ToString();
            string dateNowStr = DateTimeHelper.VietnamNowString("HHmmss");
            return $"LOTUS{dateNowStr}{random}";
        }
    }
}
