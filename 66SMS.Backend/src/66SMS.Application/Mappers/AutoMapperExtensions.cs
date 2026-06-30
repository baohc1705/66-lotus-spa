using AutoMapper;
using System;
using System.Linq.Expressions;

namespace _66SMS.Application.Mappers
{
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
