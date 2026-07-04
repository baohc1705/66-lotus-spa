import { create } from "zustand";
import type { BookingContactFormValues } from "../schemas/booking.schema";
import type {
  TechnicianDTO,
  TimeSlotDTO,
  BookingPositionDTO,
  GuestBooking,
  PromotionValidationDto,
} from "../types/booking.types";
import type { ServiceDTO } from "@/features/services/types/service.types";
import type { SalonDTO } from "@/features/salons/types/salon.types";

interface BookingState {
  currentStep: number;
  selectedSalon: SalonDTO | null;
  guests: GuestBooking[];
  activeGuestIndex: number;
  contactInfo: BookingContactFormValues | null;
  appliedPromotion: PromotionValidationDto | null;
  promotionCode: string;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  selectSalon: (salon: SalonDTO) => void;

  addGuest: () => void;
  removeGuest: (index: number) => void;
  setActiveGuest: (index: number) => void;

  // Update active guest
  updateActiveGuest: (updates: Partial<GuestBooking>) => void;
  selectService: (service: ServiceDTO) => void;
  selectTechnician: (technician: TechnicianDTO | null) => void;
  selectPosition: (position: BookingPositionDTO | null) => void;
  selectDate: (date: Date) => void;
  selectTimeSlot: (timeSlot: TimeSlotDTO | null) => void;
  setContactInfo: (info: BookingContactFormValues) => void;
  setGuestLockId: (guestIndex: number, lockId: number) => void;

  setPromotionCode: (code: string) => void;
  setAppliedPromotion: (promo: PromotionValidationDto | null) => void;
  clearPromotion: () => void;

  resetBooking: () => void;
}

const createNewGuest = (id: number): GuestBooking => ({
  id,
  selectedService: null,
  selectedTechnician: null,
  selectedPosition: null,
  selectedDate: null,
  selectedTimeSlot: null,
});

const initialState = {
  currentStep: 0,
  selectedSalon: null as SalonDTO | null,
  guests: [createNewGuest(1)],
  activeGuestIndex: 0,
  contactInfo: null,
  appliedPromotion: null as PromotionValidationDto | null,
  promotionCode: "",
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  prevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

  selectSalon: (salon) =>
    set((state) => {
      if (state.selectedSalon?.id !== salon.id) {
        const newGuests = state.guests.map((guest) => ({
          ...guest,
          selectedTechnician: null,
          selectedPosition: null,
          selectedDate: null,
          selectedTimeSlot: null,
          lockId: undefined,
        }));
        return { selectedSalon: salon, guests: newGuests, appliedPromotion: null, promotionCode: "" };
      }
      return { selectedSalon: salon };
    }),

  addGuest: () =>
    set((state) => {
      const nextId = Math.max(0, ...state.guests.map((g) => g.id)) + 1;
      const newGuests = [...state.guests, createNewGuest(nextId)];
      return { guests: newGuests, activeGuestIndex: newGuests.length - 1, appliedPromotion: null, promotionCode: "" };
    }),

  removeGuest: (index) =>
    set((state) => {
      if (state.guests.length <= 1) return state; // Must have at least 1
      const newGuests = state.guests.filter((_, i) => i !== index);
      let newActiveIndex = state.activeGuestIndex;
      if (newActiveIndex >= newGuests.length) {
        newActiveIndex = newGuests.length - 1;
      }
      return { guests: newGuests, activeGuestIndex: newActiveIndex, appliedPromotion: null, promotionCode: "" };
    }),

  setActiveGuest: (index) => set({ activeGuestIndex: index }),

  updateActiveGuest: (updates) =>
    set((state) => {
      const newGuests = [...state.guests];
      newGuests[state.activeGuestIndex] = {
        ...newGuests[state.activeGuestIndex],
        ...updates,
      };
      return { guests: newGuests };
    }),

  selectService: (service) =>
    set((state) => {
      const newGuests = [...state.guests];
      newGuests[state.activeGuestIndex].selectedService = service;
      // Reset dependent fields when service changes
      newGuests[state.activeGuestIndex].selectedTechnician = null;
      newGuests[state.activeGuestIndex].selectedPosition = null;
      newGuests[state.activeGuestIndex].selectedTimeSlot = null;
      newGuests[state.activeGuestIndex].lockId = undefined;
      return { guests: newGuests, appliedPromotion: null, promotionCode: "" };
    }),

  selectTechnician: (technician) =>
    set((state) => {
      const newGuests = [...state.guests];
      newGuests[state.activeGuestIndex].selectedTechnician = technician;
      newGuests[state.activeGuestIndex].lockId = undefined;
      return { guests: newGuests };
    }),

  selectPosition: (position) =>
    set((state) => {
      const newGuests = [...state.guests];
      newGuests[state.activeGuestIndex].selectedPosition = position;
      newGuests[state.activeGuestIndex].lockId = undefined;
      return { guests: newGuests };
    }),

  selectDate: (date) =>
    set((state) => {
      const newGuests = [...state.guests];
      newGuests[state.activeGuestIndex].selectedDate = date;
      // Reset timeslot when date changes
      newGuests[state.activeGuestIndex].selectedTimeSlot = null;
      newGuests[state.activeGuestIndex].lockId = undefined;
      return { guests: newGuests };
    }),

  selectTimeSlot: (timeSlot) =>
    set((state) => {
      const newGuests = [...state.guests];
      newGuests[state.activeGuestIndex].selectedTimeSlot = timeSlot;
      newGuests[state.activeGuestIndex].lockId = undefined;
      return { guests: newGuests };
    }),

  setContactInfo: (info) => set({ contactInfo: info }),

  setGuestLockId: (guestIndex, lockId) =>
    set((state) => {
      const newGuests = [...state.guests];
      if (newGuests[guestIndex]) {
        newGuests[guestIndex].lockId = lockId;
      }
      return { guests: newGuests };
    }),

  setPromotionCode: (code) => set({ promotionCode: code }),
  setAppliedPromotion: (promo) => set({ appliedPromotion: promo }),
  clearPromotion: () => set({ appliedPromotion: null, promotionCode: "" }),

  resetBooking: () => set(initialState),
}));
