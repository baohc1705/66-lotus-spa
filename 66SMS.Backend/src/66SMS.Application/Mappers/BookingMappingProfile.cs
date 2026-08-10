using _66SMS.Application.BookingService.BookingPositions.Commands.CreateBookingPositions;
using _66SMS.Application.BookingService.BookingPositions.Commands.UpdateBookingPositions;
using _66SMS.Application.BookingService.BookingRooms.Commands.CreateBookingRooms;
using _66SMS.Application.BookingService.BookingRooms.Commands.UpdateBookingRooms;
using _66SMS.Application.BookingService.ConfigAppointments.Commands.CreateConfigAppointment;
using _66SMS.Application.BookingService.ConfigAppointments.Commands.UpdateConfigAppointment;
using _66SMS.Application.BookingService.Shifts.Commands.CreateShift;
using _66SMS.Application.BookingService.Shifts.Commands.UpdateShift;
using _66SMS.Application.BookingService.TimeSlots.Commands.CreateTimeSlot;
using _66SMS.Application.BookingService.TimeSlots.Commands.UpdateTimeSlot;
using _66SMS.Application.BookingService.WorkSchedules.Commands.CreateWorkSchedule;
using _66SMS.Application.BookingService.WorkSchedules.Commands.UpdateWorkSchedule;
using _66SMS.Application.DTOs;
using _66SMS.Domain.Entities;
using AutoMapper;

namespace _66SMS.Application.Mappers
{
    public class BookingMappingProfile : Profile
    {
        public BookingMappingProfile()
        {
            CreateMap<CreateShiftCommand, Shift>();
            CreateMap<UpdateShiftCommand, Shift>()
                .IgnoreNullValueTypes();
            CreateMap<Shift, ShiftDTO>();

            CreateMap<CreateWorkScheduleCommand, WorkSchedule>()
                .ForMember(dest => dest.ShiftStart, opt => opt.Ignore())
                .ForMember(dest => dest.ShiftEnd, opt => opt.Ignore())
                .IgnoreNullValueTypes();

            CreateMap<UpdateWorkScheduleCommand, WorkSchedule>()
                .ForMember(dest => dest.ShiftStart, opt => opt.Ignore())
                .ForMember(dest => dest.ShiftEnd, opt => opt.Ignore())
                .IgnoreNullValueTypes();

            CreateMap<CreateBookingRoomCommand, BookingRoom>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateBookingRoomCommand, BookingRoom>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<BookingRoom, BookingRoomDto>()
                .IgnoreNullValueTypes();

            CreateMap<CreateBookingPositionCommand, BookingPosition>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateBookingPositionCommand, BookingPosition>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<BookingPosition, BookingPositionDto>()
                .ForMember(dest => dest.RoomName, opt => opt.MapFrom(src => src.Room != null ? src.Room.Name : null))
                .IgnoreNullValueTypes();

            CreateMap<CreateTimeSlotCommand, TimeSlot>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateTimeSlotCommand, TimeSlot>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<TimeSlot, TimeSlotDto>()
                .IgnoreNullValueTypes();

            CreateMap<CreateConfigAppointmentCommand, ConfigAppointment>()
                .IgnoreNullValueTypes();
            CreateMap<UpdateConfigAppointmentCommand, ConfigAppointment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .IgnoreNullValueTypes();
            CreateMap<ConfigAppointment, ConfigAppointmentDto>()
                .ForMember(dest => dest.SalonName, opt => opt.MapFrom(src => src.Salon != null ? src.Salon.Name : null))
                .IgnoreNullValueTypes();

            CreateMap<Appointment, AppointmentDto>()
                .IgnoreNullValueTypes();
        }
    }
}
