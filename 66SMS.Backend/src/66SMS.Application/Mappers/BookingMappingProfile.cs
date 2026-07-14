using _66SMS.Application.DTOs.Appointments;
using _66SMS.Application.DTOs.Shifts;
using _66SMS.Application.DTOs.TimeSlots;
using _66SMS.Application.BookingService.BookingPositions.Commands.CreateBookingPositions;
using _66SMS.Application.BookingService.BookingPositions.Commands.UpdateBookingPositions;
using _66SMS.Application.BookingService.BookingRooms.Commands.CreateBookingRooms;
using _66SMS.Application.BookingService.BookingRooms.Commands.UpdateBookingRooms;
using _66SMS.Application.BookingService.Shifts.Commands.CreateShift;
using _66SMS.Application.BookingService.Shifts.Commands.CreateShiftPeriod;
using _66SMS.Application.BookingService.Shifts.Commands.UpdateShift;
using _66SMS.Application.BookingService.TimeSlots.Commands.CreateTimeSlot;
using _66SMS.Application.BookingService.TimeSlots.Commands.UpdateTimeSlot;
using _66SMS.Application.BookingService.WorkSchedules.Commands.CreateWorkSchedule;
using _66SMS.Application.BookingService.WorkSchedules.Commands.UpdateWorkSchedule;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Entities;
using AutoMapper;
using System.Collections.Generic;
using System.Linq;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.Mappers
{
    public class BookingMappingProfile : Profile
    {
        public BookingMappingProfile()
        {
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

            // BookingRoom
            CreateMap<CreateBookingRoomCommand, BookingRoom>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateBookingRoomCommand, BookingRoom>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<BookingRoom, BookingRoomDto>()
                .IgnoreNullValueTypes();

            // BookingPosition
            CreateMap<CreateBookingPositionCommand, BookingPosition>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateBookingPositionCommand, BookingPosition>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<BookingPosition, BookingPositionDto>()
                .ForMember(dest => dest.RoomName, opt => opt.MapFrom(src => src.Room != null ? src.Room.Name : null))
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
                .IgnoreNullValueTypes();
        }
    }
}
