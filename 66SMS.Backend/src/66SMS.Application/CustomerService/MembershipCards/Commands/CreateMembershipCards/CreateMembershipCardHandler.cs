using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.CreateMembershipCards
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

            MembershipTier? tier = null;

            if (request.MembershipTierId.HasValue && request.MembershipTierId.Value > 0)
            {
                tier = await membershipTierSqlRepository.FindByIdAsync(request.MembershipTierId.Value, false, cancellationToken);
            }

            if (tier == null && !string.IsNullOrEmpty(request.MembershipTierName))
            {
                string clean = request.MembershipTierName.Trim().ToLower();
                tier = await membershipTierSqlRepository
                    .AsQueryable()
                    .FirstOrDefaultAsync(
                        x => x.Code.ToLower() == clean || x.Name.ToLower() == clean,
                        cancellationToken);
            }

            if (tier == null)
            {
                tier = await membershipTierSqlRepository
                    .AsQueryable()
                    .OrderBy(x => x.MinSpending)
                    .FirstOrDefaultAsync(cancellationToken);
            }

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
            string dateNowStr = DateTimeHelper.UtcNowString("HHmmss");
            return $"LOTUS{dateNowStr}{random}";
        }
    }
}
