using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

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
            MembershipTier membershipTier = mapper.Map<MembershipTier>(request);

            string code = string.IsNullOrWhiteSpace(request.Code)
                ? GenerateCodeFromName(request.Name)
                : request.Code.Trim().ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(code))
                return Result<int>.BadRequest("Mã hạng thẻ không hợp lệ.");

            bool codeExists = await membershipTierSqlRepository.AsQueryable(true)
                .AnyAsync(x => x.Code == code && x.Status != MembershipTierConst.STATUS_DELETED, cancellationToken);
            if (codeExists)
                return Result<int>.Conflict("Mã hạng thẻ đã tồn tại.");

            membershipTier.Code = code;
            membershipTier.Status = request.Status;

            membershipTierSqlRepository.Add(membershipTier);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<int>.Created(membershipTier.Id);
        }

        private static string GenerateCodeFromName(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return string.Empty;

            string normalized = name.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();
            foreach (char c in normalized)
            {
                var uc = CharUnicodeInfo.GetUnicodeCategory(c);
                if (uc == UnicodeCategory.NonSpacingMark) continue;
                if (char.IsLetterOrDigit(c)) sb.Append(c);
                else if (char.IsWhiteSpace(c) || c is '-' or '_') sb.Append('-');
            }

            string slug = Regex.Replace(sb.ToString().Normalize(NormalizationForm.FormC), "-+", "-").Trim('-');
            if (slug.Length > MembershipTierConst.CODE_MAX_LENGTH)
                slug = slug[..MembershipTierConst.CODE_MAX_LENGTH].TrimEnd('-');
            return slug;
        }
    }
}
