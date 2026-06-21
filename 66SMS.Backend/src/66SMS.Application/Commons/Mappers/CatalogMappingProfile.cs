using _66SMS.Application.CatalogService.ProductCategories.Commands.CreateProductCategories;
using _66SMS.Application.CatalogService.ProductCategories.Commands.UpdateProductCategories;
using _66SMS.Application.CatalogService.ProductImages.Commands.CreateProductImages;
using _66SMS.Application.CatalogService.ProductImages.Commands.UpdateProductImages;
using _66SMS.Application.CatalogService.Products.Commands.CreateProducts;
using _66SMS.Application.CatalogService.Products.Commands.UpdateProducts;
using _66SMS.Application.CatalogService.ServiceCategories.Commands.CreateServiceCategories;
using _66SMS.Application.CatalogService.ServiceCategories.Commands.UpdateServiceCategories;
using _66SMS.Application.CatalogService.ServiceImages.Commands.CreateServiceImages;
using _66SMS.Application.CatalogService.ServiceImages.Commands.UpdateServiceImages;
using _66SMS.Application.CatalogService.Services.Commands.CreateServices;
using _66SMS.Application.CatalogService.Services.Commands.UpdateServices;
using _66SMS.Application.DTOs.ProductCategories;
using _66SMS.Application.DTOs.ProductImages;
using _66SMS.Application.DTOs.ServiceCategories;
using _66SMS.Application.DTOs.ServiceImages;
using _66SMS.Application.DTOs.ServiceProducts;
using _66SMS.Application.DTOs.Services;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Entities;
using AutoMapper;

namespace _66SMS.Application.Commons.Mappers
{
    public class CatalogMappingProfile : Profile
    {
        public CatalogMappingProfile()
        {
            #region Products
            CreateMap<CreateProductCategoryCommand, ProductCategory>().IgnoreNullValueTypes();
            CreateMap<UpdateProductCategoryCommand, ProductCategory>().IgnoreNullValueTypes();
            CreateMap<ProductCategory, ProductCategoryDto>().IgnoreNullValueTypes();

            CreateMap<CreateProductCommand, Product>().IgnoreNullValueTypes();
            CreateMap<UpdateProductCommand, Product>().IgnoreNullValueTypes();

            CreateMap<CreateProductImageCommand, ProductImage>().IgnoreNullValueTypes();
            CreateMap<UpdateProductImageCommand, ProductImage>().IgnoreNullValueTypes();
            CreateMap<ProductImage, ProductImageDto>().IgnoreNullValueTypes();
            CreateMap<ProductImageDto, ProductImage>().IgnoreNullValueTypes();
            #endregion

            #region Services
            // ServiceCategory
            CreateMap<CreateServiceCategoriesCommand, ServiceCategory>().IgnoreNullValueTypes();
            CreateMap<UpdateServiceCategoriesCommand, ServiceCategory>().IgnoreNullValueTypes();

            // ServiceImage
            CreateMap<CreateServiceImagesCommand, ServiceImage>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateServiceImagesCommand, ServiceImage>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<ServiceImage, ServiceImageDto>()
                .IgnoreNullValueTypes();
            CreateMap<ServiceImage, ServiceImageResponse>()
                .IgnoreNullValueTypes();

            // ServiceProduct
            CreateMap<ServiceProduct, ServiceProductDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : null))
                .IgnoreNullValueTypes();
            CreateMap<ServiceProduct, ServiceProductResponse>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : null))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt != null ? src.UpdatedAt.Value.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss") : null))
                .IgnoreNullValueTypes();

            // Service -> ServiceDto
            CreateMap<Service, ServiceDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt != null
                    ? src.UpdatedAt.Value.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")
                    : null))
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images))
                .ForMember(dest => dest.ServiceProducts, opt => opt.MapFrom(src => src.ServiceProducts))
                .IgnoreNullValueTypes();

            // CreateService
            CreateMap<CreateServiceCommand, Service>()
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ForMember(dest => dest.ServiceProducts, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<ServiceImageItems, ServiceImage>()
                .ForMember(dest => dest.Service, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<ServiceProductItems, ServiceProduct>()
                .ForMember(dest => dest.Product, opt => opt.Ignore())
                .ForMember(dest => dest.Service, opt => opt.Ignore())
                .IgnoreNullValueTypes();

            // UpdateService
            CreateMap<UpdateServiceCommand, Service>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ForMember(dest => dest.ServiceProducts, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            #endregion

        }
    }
}
