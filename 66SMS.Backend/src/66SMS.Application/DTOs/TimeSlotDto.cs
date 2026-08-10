using System;

namespace _66SMS.Application.DTOs
{
    public class TimeSlotDto
    {
        public int Id { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
    }
}
