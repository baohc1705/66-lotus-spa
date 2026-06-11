using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;

namespace _66SMS.Application.Features.ProductImages.Commands.CreateProductImages
{
    public class CreateProductImageHandler : IRequestHandler<CreateProductImageCommand, Result<int>>
    {
        private readonly IProductImageSqlRepository productImageSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreateProductImageHandler(
            IProductImageSqlRepository productImageSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.productImageSqlRepository = productImageSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<int>> Handle(CreateProductImageCommand request, CancellationToken cancellationToken)
        {
            ProductImage productImage = mapper.Map<ProductImage>(request);

            productImageSqlRepository.Add(productImage);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<int>.Success(productImage.Id);
        }
    }
}
