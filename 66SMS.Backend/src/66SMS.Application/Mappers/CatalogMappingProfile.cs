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
using _66SMS.Application.CatalogService.TreatmentCourses.Commands.CreateTreatmentCourse;
using _66SMS.Application.CatalogService.TreatmentCourses.Commands.UpdateTreatmentCourse;
using _66SMS.Application.DTOs.ProductCategories;
using _66SMS.Application.DTOs.ProductImages;
using _66SMS.Application.DTOs.ServiceImages;
using _66SMS.Application.DTOs.ServiceProducts;
using _66SMS.Application.DTOs.Services;
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

            CreateMap<CreateProductCommand, Product>().IgnoreNullValueTypes();
            CreateMap<UpdateProductCommand, Product>().IgnoreNullValueTypes();

            CreateMap<CreateProductImageCommand, ProductImage>().IgnoreNullValueTypes();
            CreateMap<UpdateProductImageCommand, ProductImage>().IgnoreNullValueTypes();
            CreateMap<ProductImage, ProductImageDto>().IgnoreNullValueTypes();
            CreateMap<ProductImageDto, ProductImage>().IgnoreNullValueTypes();
            #endregion

            #region Services
            CreateMap<CreateServiceCategoriesCommand, ServiceCategory>().IgnoreNullValueTypes();
            CreateMap<UpdateServiceCategoriesCommand, ServiceCategory>().IgnoreNullValueTypes();

            CreateMap<CreateServiceImagesCommand, ServiceImage>().IgnoreNullValueTypes();
            CreateMap<UpdateServiceImagesCommand, ServiceImage>().IgnoreNullValueTypes();
            CreateMap<ServiceImage, ServiceImageDto>().IgnoreNullValueTypes();
            CreateMap<ServiceImage, ServiceImageResponse>().IgnoreNullValueTypes();
            CreateMap<ServiceProduct, ServiceProductDto>().IgnoreNullValueTypes();
            CreateMap<ServiceProduct, ServiceProductResponse>().IgnoreNullValueTypes();
            CreateMap<Service, ServiceDto>().IgnoreNullValueTypes();

            CreateMap<CreateServiceCommand, Service>().IgnoreNullValueTypes();
            CreateMap<ServiceImageItems, ServiceImage>().IgnoreNullValueTypes();
            CreateMap<ServiceProductItems, ServiceProduct>().IgnoreNullValueTypes();
            CreateMap<UpdateServiceCommand, Service>().IgnoreNullValueTypes();
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
