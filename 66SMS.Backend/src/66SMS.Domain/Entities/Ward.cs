using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Ward : EntityBase<string>
    {
        public string? Name { get; set; }
        public string? FullName { get; set; }
        public string? ProvinceCode { get; set; }
    }
}
