export function eventLabel(eventType: string): string {
  if (eventType === "AppointmentCreated") return "Đặt lịch";
  if (eventType === "AppointmentStatusChanged") return "Cập nhật";
  if (eventType === "DepositPaid") return "Đã cọc";
  return eventType;
}

export function eventBadgeClass(eventType: string, variant: "admin" | "lotus" = "admin"): string {
  if (variant === "lotus") {
    if (eventType === "AppointmentCreated") {
      return "bg-lotus-gold/20 text-lotus-deep";
    }
    if (eventType === "DepositPaid") {
      return "bg-lotus-leaf-light text-lotus-leaf";
    }
    return "bg-lotus-cream text-lotus-stone";
  }

  if (eventType === "AppointmentCreated") {
    return "bg-adminGold-100 text-adminGold-700";
  }
  if (eventType === "DepositPaid") {
    return "bg-adminGreen-100 text-adminGreen-700";
  }
  return "bg-adminGray-100 text-adminGray-600";
}
