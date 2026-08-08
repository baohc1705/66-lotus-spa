using _66SMS.Application.CatalogService.ProductCategories.Commands.CreateProductCategories;
using _66SMS.Application.CatalogService.ProductCategories.Commands.UpdateProductCategories;
using _66SMS.Application.CatalogService.Products.Commands.CreateProducts;
using _66SMS.Application.CatalogService.Products.Commands.UpdateProducts;
using _66SMS.Application.CatalogService.ServiceCategories.Commands.CreateServiceCategories;
using _66SMS.Application.CatalogService.ServiceCategories.Commands.UpdateServiceCategories;
using _66SMS.Application.CatalogService.ServiceProducts.Commands.CreateServiceProducts;
using _66SMS.Application.CatalogService.ServiceProducts.Commands.UpdateServiceProducts;
using _66SMS.Application.CatalogService.Services.Commands.CreateServices;
using _66SMS.Application.CatalogService.Services.Commands.UpdateServices;
using _66SMS.Application.CatalogService.TreatmentCourses.Commands.CreateTreatmentCourse;
using _66SMS.Application.CatalogService.TreatmentCourses.Commands.UpdateTreatmentCourse;
using _66SMS.Application.DTOs;
using _66SMS.Domain.Entities;
using AutoMapper;

namespace _66SMS.Application.Mappers
{
    public class CatalogMappingProfile : Profile
    {
        public CatalogMappingProfile()
        {
            #region Products
            CreateMap<CreateProductCategoryCommand, ProductCategory>().IgnoreNullValueTypes();
            CreateMap<UpdateProductCategoryCommand, ProductCategory>().IgnoreNullValueTypes();
            CreateMap<ProductCategory, ProductCategoryDto>().IgnoreNullValueTypes();

            CreateMap<CreateProductCommand, Product>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<UpdateProductCommand, Product>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .IgnoreNullValueTypes();

            CreateMap<ProductImage, ProductImageDto>()
                .ForMember(dest => dest.ImageBase64, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<ProductImageDto, ProductImage>().IgnoreNullValueTypes();
            #endregion

            #region Services
            CreateMap<CreateServiceCategoriesCommand, ServiceCategory>().IgnoreNullValueTypes();
            CreateMap<UpdateServiceCategoriesCommand, ServiceCategory>().IgnoreNullValueTypes();

            CreateMap<ServiceImage, ServiceImageDto>().IgnoreNullValueTypes();
            CreateMap<ServiceProduct, ServiceProductDto>().IgnoreNullValueTypes();
            CreateMap<ServiceProduct, ServiceProductResponse>().IgnoreNullValueTypes();

            CreateMap<CreateServiceCommand, Service>().IgnoreNullValueTypes();
            CreateMap<ServiceImageItems, ServiceImage>().IgnoreNullValueTypes();
            CreateMap<ServiceProductItems, ServiceProduct>().IgnoreNullValueTypes();
            CreateMap<CreateServiceProductCommand, ServiceProduct>().IgnoreNullValueTypes();
            CreateMap<UpdateServiceProductCommand, ServiceProduct>()
                .ForMember(d => d.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<UpdateServiceCommand, Service>()
                .ForMember(d => d.ServiceProducts, opt => opt.Ignore())
                .ForMember(d => d.ImageUrl, opt => opt.Ignore())
                .ForMember(d => d.Code, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            #endregion

            #region Treament Course
            CreateMap<CreateTreatmentCourseCommand, TreatmentCourse>().IgnoreNullValueTypes();
            CreateMap<UpdateTreatmentCourseCommand, TreatmentCourse>().IgnoreNullValueTypes();
            CreateMap<CreateTreatmentCourseItemDto, TreatmentCourseItem>().IgnoreNullValueTypes();
            CreateMap<UpdateTreatmentCourseItemDto, TreatmentCourseItem>().IgnoreNullValueTypes();
            #endregion
        }
    }
}
