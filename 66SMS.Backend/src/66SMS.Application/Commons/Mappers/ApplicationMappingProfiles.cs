using _66SMS.Application.DTOs.Appointments;
using _66SMS.Application.DTOs.BookingPositions;
using _66SMS.Application.DTOs.BookingRooms;
using _66SMS.Application.DTOs.Customers;
using _66SMS.Application.DTOs.ProductCategories;
using _66SMS.Application.DTOs.ProductImages;
using _66SMS.Application.DTOs.Products;
using _66SMS.Application.DTOs.ServiceCategories;
using _66SMS.Application.DTOs.ServiceImages;
using _66SMS.Application.DTOs.ServiceProducts;
using _66SMS.Application.DTOs.Services;
using _66SMS.Application.DTOs.Shifts;
using _66SMS.Application.DTOs.Staffs;
using _66SMS.Application.DTOs.TimeSlots;
using _66SMS.Application.DTOs.Users;
using _66SMS.Application.Features.Auth.Commands.CreatePermission;
using _66SMS.Application.Features.Auth.Commands.CreateRole;
using _66SMS.Application.Features.BookingPositions.Commands.CreateBookingPositions;
using _66SMS.Application.Features.BookingPositions.Commands.UpdateBookingPositions;
using _66SMS.Application.Features.BookingRooms.Commands.CreateBookingRooms;
using _66SMS.Application.Features.BookingRooms.Commands.UpdateBookingRooms;
using _66SMS.Application.Features.Customers.Commands.CreateCustomer;
using _66SMS.Application.Features.Customers.Commands.UpdateCustomer;
using _66SMS.Application.Features.ProductCategories.Commands.CreateProductCategories;
using _66SMS.Application.Features.ProductCategories.Commands.UpdateProductCategories;
using _66SMS.Application.Features.ProductImages.Commands.CreateProductImages;
using _66SMS.Application.Features.ProductImages.Commands.UpdateProductImages;
using _66SMS.Application.Features.Products.Commands.CreateProducts;
using _66SMS.Application.Features.Products.Commands.UpdateProducts;
using _66SMS.Application.Features.ServiceCategories.Commands.CreateServiceCategories;
using _66SMS.Application.Features.ServiceCategories.Commands.UpdateServiceCategories;
using _66SMS.Application.Features.ServiceImages.Commands.CreateServiceImages;
using _66SMS.Application.Features.ServiceImages.Commands.UpdateServiceImages;
using _66SMS.Application.Features.Services.Commands.CreateServices;
using _66SMS.Application.Features.Services.Commands.UpdateServices;
using _66SMS.Application.Features.Shifts.Commands.CreateShift;
using _66SMS.Application.Features.Shifts.Commands.CreateShiftPeriod;
using _66SMS.Application.Features.Shifts.Commands.UpdateShift;
using _66SMS.Application.Features.Staffs.Commands.CreateStaff;
using _66SMS.Application.Features.Staffs.Commands.UpdateStaff;
using _66SMS.Application.Features.TimeSlots.Commands.CreateTimeSlot;
using _66SMS.Application.Features.TimeSlots.Commands.UpdateTimeSlot;
using _66SMS.Application.Features.Users.Commands.UpdateUser;
using _66SMS.Application.Features.WorkSchedules.Commands.CreateWorkSchedule;
using _66SMS.Application.Features.WorkSchedules.Commands.UpdateWorkSchedule;
using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Application.DTOs.MembershipTiers;
using _66SMS.Application.Features.MembershipCards.Commands.CreateMembershipCards;
using _66SMS.Application.Features.MembershipCards.Commands.UpdateMembershipCards;
using _66SMS.Application.Features.MembershipTiers.Commands.CreateMembershipTiers;
using _66SMS.Application.Features.MembershipTiers.Commands.UpdateMembershipTiers;
using _66SMS.Application.DTOs.Salons;
using _66SMS.Application.DTOs.StaffSalons;
using _66SMS.Application.Features.Salons.Commands.CreateSalon;
using _66SMS.Application.Features.Salons.Commands.UpdateSalon;
using _66SMS.Application.Features.StaffSalons.Commands.CreateStaffSalon;
using _66SMS.Application.Features.StaffSalons.Commands.UpdateStaffSalon;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Entities;
using AutoMapper;
using System.Linq.Expressions;

namespace _66SMS.Application.Commons.Mappers
{
    public class ApplicationMappingProfiles : Profile
    {
        public ApplicationMappingProfiles()
        {
            // Update user
            CreateMap<UpdateUserCommand, User>()
                .IgnoreNullValueTypes();

            CreateMap<User, UserDto>();

            // Create permission
            CreateMap<CreatePermissionCommand, Permission>();

            // Create role
            CreateMap<CreateRoleCommand, Role>();

            // Create customer
            CreateMap<CreateCustomerCommand, User>()
                .IgnoreNullValueTypes();
            CreateMap<CreateCustomerCommand, Customer>()
                .IgnoreNullValueTypes();

            // Create staff
            CreateMap<CreateStaffCommand, User>()
                .IgnoreNullValueTypes();
            CreateMap<CreateStaffCommand, Staff>()
                .IgnoreNullValueTypes();

            // Update customer
            CreateMap<UpdateCustomerCommand, Customer>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<UpdateCustomerCommand, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();

            // Update staff
            CreateMap<UpdateStaffCommand, Staff>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<UpdateStaffCommand, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();

            // Customer DTO
            CreateMap<Customer, CustomerDTO>()
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.DateOfBirth.ToDateOnlyString()))
                .ForMember(dest => dest.FirstPurchaseAt, opt => opt.MapFrom(src => src.FirstPurchaseAt.ToVietnamTimeString("dd/MM/yyyy HH:mm")))
                .ForMember(dest => dest.LastPurchaseAt, opt => opt.MapFrom(src => src.LastPurchaseAt.ToVietnamTimeString("dd/MM/yyyy HH:mm")))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : null))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User != null ? src.User.Email : null))
                .IgnoreNullValueTypes();

            // Staff DTO
            CreateMap<Staff, StaffDto>()
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.DateOfBirth.ToDateOnlyString("dd/MM/yyyy")))
                .ForMember(dest => dest.HireDate, opt => opt.MapFrom(src => src.HireDate.ToDateOnlyString("dd/MM/yyyy")))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : null))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User != null ? src.User.Email : null))
                .IgnoreNullValueTypes();

            // Create shift command to entity
            CreateMap<CreateShiftCommand, Shift>()
                .ForMember(dest => dest.ShiftPeriods, opt => opt.Ignore());
            CreateMap<CreateShiftPeriodDto, ShiftPeriod>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.ShiftId, opt => opt.Ignore())
                .ForMember(dest => dest.Shift, opt => opt.Ignore())
                .ForMember(dest => dest.WorkSchedules, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.EffectiveFrom, opt => opt.MapFrom(src => src.EffectiveFrom ?? DateTimeHelper.UtcNow().ToDateOnly()));
            CreateMap<CreateShiftPeriodCommand, ShiftPeriod>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Shift, opt => opt.Ignore())
                .ForMember(dest => dest.WorkSchedules, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.EffectiveFrom, opt => opt.MapFrom(src => src.EffectiveFrom ?? DateTimeHelper.UtcNow().ToDateOnly()));

            // Update shift command to entity
            CreateMap<UpdateShiftCommand, Shift>()
                .ForMember(dest => dest.ShiftPeriods, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<UpdateShiftPeriodDto, ShiftPeriod>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.ShiftId, opt => opt.Ignore())
                .ForMember(dest => dest.Shift, opt => opt.Ignore())
                .ForMember(dest => dest.WorkSchedules, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<ShiftPeriodDTO, ShiftPeriod>()
                .IgnoreNullValueTypes();

            // Projection mapping rules
            CreateMap<Shift, ShiftDTO>()
                .ForMember(dest => dest.ShiftPeriodDTOs, opt => opt.MapFrom(src => src.ShiftPeriods));
            CreateMap<ShiftPeriod, ShiftPeriodDTO>();

            // Create WorkSchedule
            CreateMap<CreateWorkScheduleCommand, WorkSchedule>()
                .IgnoreNullValueTypes();

            // Update WorkSchedule
            CreateMap<UpdateWorkScheduleCommand, WorkSchedule>()
                .IgnoreNullValueTypes();

            // WorkSchedule DTO

            // ProductCategory
            CreateMap<CreateProductCategoryCommand, ProductCategory>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateProductCategoryCommand, ProductCategory>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<ProductCategory, ProductCategoryDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyy hh:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt.ToVietnamTimeString("dd/MM/yyy hh:mm:ss")))
                .IgnoreNullValueTypes();

            // ProductImage
            CreateMap<CreateProductImageCommand, ProductImage>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateProductImageCommand, ProductImage>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<ProductImage, ProductImageDto>()
                .IgnoreNullValueTypes();
            CreateMap<ProductImageDto, ProductImage>()
                .IgnoreNullValueTypes();

            // Product
            CreateMap<CreateProductCommand, Product>()
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<UpdateProductCommand, Product>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyy hh:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt.ToVietnamTimeString("dd/MM/yyy hh:mm:ss")))
                .IgnoreNullValueTypes(); ;

            // ServiceCategory
            CreateMap<CreateServiceCategoriesCommand, ServiceCategory>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateServiceCategoriesCommand, ServiceCategory>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<ServiceCategory, ServiceCategoryDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt != null
                    ? src.UpdatedAt.Value.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")
                    : null))
                .IgnoreNullValueTypes();

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

            // BookingRoom
            CreateMap<CreateBookingRoomCommand, BookingRoom>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateBookingRoomCommand, BookingRoom>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<BookingRoom, BookingRoomDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt != null ? src.UpdatedAt.Value.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss") : null))
                .IgnoreNullValueTypes();

            // BookingPosition
            CreateMap<CreateBookingPositionCommand, BookingPosition>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateBookingPositionCommand, BookingPosition>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<BookingPosition, BookingPositionDto>()
                .ForMember(dest => dest.RoomName, opt => opt.MapFrom(src => src.Room != null ? src.Room.Name : null))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt != null ? src.UpdatedAt.Value.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss") : null))
                .IgnoreNullValueTypes();

            // TimeSlot
            CreateMap<CreateTimeSlotCommand, TimeSlot>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateTimeSlotCommand, TimeSlot>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<TimeSlot, TimeSlotDto>()
                .IgnoreNullValueTypes();

            // AppointmentDto
            CreateMap<Appointment, AppointmentDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.ServiceNames, opt => opt.MapFrom(src => src.Services != null ? src.Services.Select(x => x.Service != null ? x.Service.Name : "").ToList() : new List<string>()))
                .ForMember(dest => dest.DepositPercent, opt => opt.MapFrom(src => src.DepositPercent ?? _66SMS.Application.Services.Appointments.AppointmentPaymentCalculator.DefaultDepositPercent))
                .IgnoreNullValueTypes();

            // MembershipTier mappings
            CreateMap<CreateMembershipTierCommand, MembershipTier>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateMembershipTierCommand, MembershipTier>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<MembershipTier, MembershipTierDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .IgnoreNullValueTypes();

            // MembershipCard mappings
            CreateMap<CreateMembershipCardCommand, MembershipCard>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateMembershipCardCommand, MembershipCard>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<MembershipCard, MembershipCardDto>()
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : null))
                .ForMember(dest => dest.TierName, opt => opt.MapFrom(src => src.Tier != null ? src.Tier.Name : null))
                .ForMember(dest => dest.IssuedAt, opt => opt.MapFrom(src => src.IssuedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.ExpiresAt, opt => opt.MapFrom(src => src.ExpiresAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .IgnoreNullValueTypes();

            // StaffSalon
            CreateMap<CreateStaffSalonCommand, StaffSalon>().IgnoreNullValueTypes();
            CreateMap<UpdateStaffSalonCommand, StaffSalon>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.StaffId, opt => opt.Ignore())
                .ForMember(dest => dest.SalonId, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<StaffSalon, StaffSalonDto>()
                .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate.ToDateOnlyString("dd/MM/yyyy")))
                .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.EndDate.ToDateOnlyString("dd/MM/yyyy")))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt != null ? src.UpdatedAt.Value.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss") : null))
                .IgnoreNullValueTypes();

            // Salon
            CreateMap<CreateSalonCommand, Salon>().IgnoreNullValueTypes();
            CreateMap<UpdateSalonCommand, Salon>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<Salon, SalonDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss")))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt != null ? src.UpdatedAt.Value.ToVietnamTimeString("dd/MM/yyyy HH:mm:ss") : null))
                .IgnoreNullValueTypes();
        }
    }

    public static class AutoMapperExtensions
    {
        /// <summary>
        /// Tự động sinh biểu thức điều kiện (PreCondition) để bỏ qua các trường có giá trị null (cả Value Type Nullable và Reference Type).
        /// </summary>
        public static IMappingExpression<TSource, TDestination> IgnoreNullValueTypes<TSource, TDestination>(
            this IMappingExpression<TSource, TDestination> map)
        {
            var sourceType = typeof(TSource);
            var destinationType = typeof(TDestination);

            // Duyệt qua từng thuộc tính (Property) của đối tượng nguồn (Source)
            foreach (var property in sourceType.GetProperties())
            {
                var propertyType = property.PropertyType;

                // Tìm thuộc tính tương ứng ở đối tượng đích (Destination) có cùng tên
                var destProperty = destinationType.GetProperty(property.Name);

                if (destProperty != null)
                {
                    // Kiểm tra thuộc tính nguồn có phải là Nullable Value Type (int?, DateOnly?, bool?...) hay không
                    bool isNullableValueType = propertyType.IsGenericType && propertyType.GetGenericTypeDefinition() == typeof(Nullable<>);

                    // Kiểm tra thuộc tính nguồn có phải là Reference Type (string, class...) hay không
                    bool isReferenceType = !propertyType.IsValueType;

                    // Chỉ áp dụng điều kiện loại bỏ Null cho các trường có thể mang giá trị Null
                    if (isNullableValueType || isReferenceType)
                    {
                        // Khởi tạo tham số đại diện cho đối tượng nguồn: "src => ..."
                        var parameter = Expression.Parameter(sourceType, "src");

                        // Lấy giá trị của thuộc tính: "src.PropertyName"
                        var propertyAccess = Expression.Property(parameter, property);

                        // Định nghĩa hằng số null tương thích với kiểu dữ liệu của thuộc tính
                        var nullConstant = Expression.Constant(null, propertyType);

                        // Tạo so sánh khác null: "src.PropertyName != null"
                        var conditionExpr = Expression.NotEqual(propertyAccess, nullConstant);

                        // Xây dựng Lambda Expression dạng: src => src.PropertyName != null
                        var lambda = Expression.Lambda<Func<TSource, bool>>(conditionExpr, parameter);

                        // Biên dịch Lambda Expression thành Delegate để thực thi trong runtime
                        var compiledCondition = lambda.Compile();

                        // Đăng ký PreCondition cho thuộc tính đích.
                        // Nếu giá trị nguồn là null (PreCondition trả về false), AutoMapper sẽ bỏ qua không map thuộc tính này.
                        map.ForMember(destProperty.Name, opt => opt.PreCondition(compiledCondition));
                    }
                }
            }

            return map;
        }
    }
}
