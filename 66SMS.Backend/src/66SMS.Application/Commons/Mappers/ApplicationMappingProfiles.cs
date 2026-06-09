using _66SMS.Application.DTOs.Customers;
using _66SMS.Application.DTOs.Employees;
using _66SMS.Application.DTOs.Shifts;
using _66SMS.Application.DTOs.Users;
using _66SMS.Application.Features.Auth.Commands.CreatePermission;
using _66SMS.Application.Features.Auth.Commands.CreateRole;
using _66SMS.Application.Features.Customers.Commands.CreateCustomer;
using _66SMS.Application.Features.Customers.Commands.UpdateCustomer;
using _66SMS.Application.Features.Employees.Commands.CreateEmployee;
using _66SMS.Application.Features.Employees.Commands.UpdateEmployee;
using _66SMS.Application.Features.Shitfs.Commands.CreateShift;
using _66SMS.Application.Features.Shitfs.Commands.CreateShiftPeriod;
using _66SMS.Application.Features.Shitfs.Commands.UpdateShift;
using _66SMS.Application.Features.Users.Commands.CreateUser;
using _66SMS.Application.Features.Users.Commands.UpdateUser;
using _66SMS.Application.Features.WorkSchedules.Commands.CreateWorkSchedule;
using _66SMS.Application.Features.WorkSchedules.Commands.UpdateWorkSchedule;
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
            CreateMap<CreateUserCommand, User>();
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

            // Create employee
            CreateMap<CreateEmployeeCommand, User>()
                .IgnoreNullValueTypes();
            CreateMap<CreateEmployeeCommand, Employee>()
                .IgnoreNullValueTypes();

            // Update customer
            CreateMap<UpdateCustomerCommand, Customer>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<UpdateCustomerCommand, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();

            // Update employee
            CreateMap<UpdateEmployeeCommand, Employee>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<UpdateEmployeeCommand, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();

            // Customer DTO
            CreateMap<Customer, CustomerDTO>()
                .ForMember(dest => dest.Dob, opt => opt.MapFrom(src => src.Dob.ToDateOnlyString()))
                .ForMember(dest => dest.FirstPurchaseAt, opt => opt.MapFrom(src => src.FirstPurchaseAt.ToVietnamTimeString("dd/MM/yyyy HH:mm")))
                .ForMember(dest => dest.LastPurchaseAt, opt => opt.MapFrom(src => src.LastPurchaseAt.ToVietnamTimeString("dd/MM/yyyy HH:mm")))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : null))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User != null ? src.User.Email : null))
                .IgnoreNullValueTypes();

            // Employee DTO
            CreateMap<Employee, EmployeeDTO>()
                .ForMember(dest => dest.Dob, opt => opt.MapFrom(src => src.Dob.ToDateOnlyString("dd/MM/yyyy")))
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
           
        }
    }

    public static class AutoMapperExtensions
    {
        /// <summary>
        /// Tự động sinh biểu thức điều kiện (PreCondition) để bỏ qua các trường có giá trị null (cả Value Type Nullable và Reference Type).
        /// Áp dụng cho toàn bộ các member để không cần lặp lại ForAllMembers hay ForMember riêng lẻ.
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
