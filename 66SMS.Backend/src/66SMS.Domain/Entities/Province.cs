using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Province : EntityBase<string>
    {
        public string? Name { get; set; }
        public string? FullName { get; set; }
    }
}
