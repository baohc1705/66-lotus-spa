import { create } from "zustand";
import type { BookingContactFormValues } from "../schemas/booking.schema";
import type {
  TechnicianDTO,
  TimeSlotDTO,
  GuestBooking,
  PromotionValidationDto,
} from "../types/booking.types";
import type { ServiceDto } from "@/features/services/types/service.types";
import type { SalonDTO } from "@/features/salons/types/salon.types";
import { clearPendingServiceId } from "../utils/pendingBookingService";

// Store = hộp nhớ dùng chung cho cả flow đặt lịch.
// Dùng zustand để SalonStep / ServiceStep / sidebar đọc cùng 1 nguồn.
// Nếu tách state riêng từng page, đổi bước là mất dữ liệu.

interface BookingState {
  currentStep: number;
  selectedSalon: SalonDTO | null;
  guests: GuestBooking[];
  activeGuestIndex: number;
  contactInfo: BookingContactFormValues | null;
  appliedPromotion: PromotionValidationDto | null;
  promotionCode: string;
  createdBookingIds: number[];

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  selectSalon: (salon: SalonDTO) => void;

  addGuest: () => void;
  removeGuest: (index: number) => void;
  setActiveGuest: (index: number) => void;

  updateActiveGuest: (updates: Partial<GuestBooking>) => void;
  toggleService: (service: ServiceDto) => void;
  selectTechnician: (technician: TechnicianDTO | null) => void;
  selectDate: (date: Date) => void;
  selectTimeSlot: (timeSlot: TimeSlotDTO | null) => void;
  setContactInfo: (info: BookingContactFormValues) => void;
  setGuestLockId: (guestIndex: number, lockId: number) => void;
  setCreatedBookingIds: (ids: number[]) => void;

  setPromotionCode: (code: string) => void;
  setAppliedPromotion: (promo: PromotionValidationDto | null) => void;
  clearPromotion: () => void;

  resetBooking: () => void;
}

function createNewGuest(id: number): GuestBooking {
  return {
    id,
    selectedServices: [],
    selectedTechnician: null,
    selectedDate: null,
    selectedTimeSlot: null,
  };
}

const initialState = {
  currentStep: 0,
  selectedSalon: null as SalonDTO | null,
  // Mặc định 1 khách. Đừng để guests = [] vì nhiều chỗ đọc guests[0].
  guests: [createNewGuest(1)],
  activeGuestIndex: 0,
  contactInfo: null,
  appliedPromotion: null as PromotionValidationDto | null,
  promotionCode: "",
  createdBookingIds: [] as number[],
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  // max 4 = màn thành công. Nếu thêm bước mới phải tăng số này.
  nextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  prevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

  selectSalon: (salon) =>
    set((state) => {
      // Đổi salon thì xóa giờ/KTV cũ vì thuộc chi nhánh khác.
      // Nếu không clear, dễ gửi lock với salon mới nhưng slot cũ.
      if (state.selectedSalon?.id !== salon.id) {
        const newGuests = [];
        for (let index = 0; index < state.guests.length; index++) {
          const guest = state.guests[index];
          newGuests.push({
            ...guest,
            selectedTechnician: null,
            selectedDate: null,
            selectedTimeSlot: null,
            lockId: undefined,
          });
        }
        return {
          selectedSalon: salon,
          guests: newGuests,
          appliedPromotion: null,
          promotionCode: "",
        };
      }
      return { selectedSalon: salon };
    }),

  addGuest: () =>
    set((state) => {
      let maxId = 0;
      for (let index = 0; index < state.guests.length; index++) {
        if (state.guests[index].id > maxId) {
          maxId = state.guests[index].id;
        }
      }

      const newGuests = [...state.guests, createNewGuest(maxId + 1)];
      return {
        guests: newGuests,
        // Nhảy sang khách mới để user chọn dịch vụ ngay.
        activeGuestIndex: newGuests.length - 1,
        appliedPromotion: null,
        promotionCode: "",
      };
    }),

  removeGuest: (index) =>
    set((state) => {
      // Luôn giữ ít nhất 1 khách.
      if (state.guests.length <= 1) return state;

      const newGuests = [];
      for (let guestIndex = 0; guestIndex < state.guests.length; guestIndex++) {
        if (guestIndex === index) continue;
        newGuests.push(state.guests[guestIndex]);
      }

      let newActiveIndex = state.activeGuestIndex;
      if (newActiveIndex >= newGuests.length) {
        newActiveIndex = newGuests.length - 1;
      }

      return {
        guests: newGuests,
        activeGuestIndex: newActiveIndex,
        appliedPromotion: null,
        promotionCode: "",
      };
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

  // Có rồi thì bỏ, chưa có thì thêm. Đổi dịch vụ thì xóa KTV/giờ vì combo đổi.
  toggleService: (service) =>
    set((state) => {
      const newGuests = [...state.guests];
      const guest = newGuests[state.activeGuestIndex];
      const current = guest.selectedServices ?? [];
      const nextServices: ServiceDto[] = [];
      let found = false;

      for (let index = 0; index < current.length; index++) {
        if (current[index].id === service.id) {
          found = true;
          continue;
        }
        nextServices.push(current[index]);
      }

      if (!found) {
        nextServices.push(service);
      }

      guest.selectedServices = nextServices;
      guest.selectedTechnician = null;
      guest.selectedTimeSlot = null;
      guest.lockId = undefined;

      return { guests: newGuests, appliedPromotion: null, promotionCode: "" };
    }),

  selectTechnician: (technician) =>
    set((state) => {
      const newGuests = [...state.guests];
      newGuests[state.activeGuestIndex].selectedTechnician = technician;
      newGuests[state.activeGuestIndex].lockId = undefined;
      return { guests: newGuests };
    }),

  selectDate: (date) =>
    set((state) => {
      const newGuests = [...state.guests];
      newGuests[state.activeGuestIndex].selectedDate = date;
      // Đổi ngày thì giờ cũ không còn đúng.
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
  setCreatedBookingIds: (ids) => set({ createdBookingIds: ids }),

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

  // Reset sau đặt thành công / đặt lại từ đầu.
  // Nhớ clear pending serviceId kẻo lần sau tự tick dịch vụ cũ.
  resetBooking: () => {
    clearPendingServiceId();
    set(initialState);
  },
}));
