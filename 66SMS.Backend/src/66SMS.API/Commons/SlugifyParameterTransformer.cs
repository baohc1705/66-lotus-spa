using System.Text.RegularExpressions;
namespace _66SMS.API.Commons
{
    /// <summary>
    /// Chuyển controller token PascalCase sang kebab-case trong URL.
    /// Ví dụ: ProductCategory → product-category, TimeSlots → time-slots
    /// </summary>
    public class SlugifyParameterTransformer : IOutboundParameterTransformer
    {
        public string? TransformOutbound(object? value)
        {
            if (value == null) return null;
            return Regex.Replace(value.ToString()!, "([a-z])([A-Z])", "$1-$2").ToLowerInvariant();
        }
    }
}
