using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class StaffSalon : EntityBase<int>
    {
        public int StaffId { get; set; }
        public int SalonId { get; set; }
        public bool IsManager { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public Salon? Salon { get; set; }
        public Staff? Staff { get; set; }
    }
}
