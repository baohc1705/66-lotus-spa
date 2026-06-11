using _66SMS.Application.DTOs.Services;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Entities;

namespace _66SMS.Application.Features.Services.Queries.GetAllServices
{
    public static class ServiceSelectExtensions
    {
        public static IQueryable<ServiceDto> SelectServiceDto(
            this IQueryable<Service> query, string? includes)
        {
            var includeAll = string.IsNullOrEmpty(includes);
            var inc = includes?.ToLower();

            return query.Select(x => new ServiceDto
            {
                Id = x.Id,
                CategoryId = x.CategoryId,
                Code = x.Code,
                Name = x.Name,
                Description = x.Description,
                Content = x.Content,
                DurationMins = x.DurationMins,
                Price = x.Price,
                CommissionRate = x.CommissionRate,
                SortOrder = x.SortOrder,
                Status = x.Status,
                CreatedAt = x.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss"),
                UpdatedAt = x.UpdatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss"),

                CategoryName = includeAll || inc == "category"
                    ? x.Category.Name
                    : null,

                Images = includeAll || inc == "service_image"
                    ? x.Images.Select(img => new ServiceImageResponse
                    {
                        Id = img.Id,
                        Url = img.Url,
                        SortOrder = img.SortOrder,
                        IsPrimary = img.IsPrimary
                    }).ToList()
                    : null,

                ServiceProducts = includeAll || inc == "service_product"
                    ? x.ServiceProducts.Select(sp => new ServiceProductResponse
                    {
                        Id = sp.Id,
                        ProductId = sp.ProductId,
                        ProductName = sp.Product.Name,
                        QuantityUsed = sp.QuantityUsed,
                        Note = sp.Note,
                        Status = sp.Status,
                        CreatedAt = sp.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss"),
                        UpdatedAt = sp.UpdatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")
                    }).ToList()
                    : null,
            });
        }
    }
}

