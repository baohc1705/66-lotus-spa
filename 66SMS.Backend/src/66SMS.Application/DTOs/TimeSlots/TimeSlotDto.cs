using System;

namespace _66SMS.Application.DTOs.TimeSlots
{
    public class TimeSlotDto
    {
        public int Id { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}
