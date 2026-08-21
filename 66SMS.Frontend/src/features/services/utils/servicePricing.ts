// Giải thích:
// Tính giá gợi ý và lãi trên client chỉ để preview. Số chốt do BE.

// Giải thích:
// Làm tròn tiền VND. Dùng khi cộng chi phí và hiện số trên form.
export function lamTronVnd(giaTri: number): number {
  return Math.round(giaTri);
}

// Giải thích:
// Giá bán tối thiểu để hòa vốn sau hoa hồng: tongGiaVon / (1 - tyLeHoaHong/100).
// Dùng nút "Áp dụng gợi ý" cho ô giá bán tối thiểu.
export function tinhGiaBanToiThieu(
  tongGiaVon: number,
  tyLeHoaHong: number,
): number {
  const tyLe = Math.min(Math.max(tyLeHoaHong || 0, 0), 99.99);
  if (tyLe <= 0) {
    return lamTronVnd(tongGiaVon);
  }
  return lamTronVnd(tongGiaVon / (1 - tyLe / 100));
}

// Giải thích:
// Giá bán gợi ý theo % lãi mong muốn: tongGiaVon * (1 + lai/100) / (1 - hoaHong/100).
// Dùng nút "Áp dụng gợi ý" cho ô giá bán.
export function tinhGiaBan(
  tongGiaVon: number,
  tyLeHoaHong: number,
  phanTramLaiMongMuon: number,
): number {
  const hoaHong = Math.min(Math.max(tyLeHoaHong || 0, 0), 99.99);
  const lai = Math.max(phanTramLaiMongMuon || 0, 0);
  const sauHoaHong = 1 - hoaHong / 100;

  if (sauHoaHong <= 0) {
    return lamTronVnd(tongGiaVon);
  }

  return lamTronVnd((tongGiaVon * (1 + lai / 100)) / sauHoaHong);
}

// Giải thích:
// Tiền hoa hồng = giaBan * tyLeHoaHong / 100. Hiện ở khối "Lãi dự kiến".
export function tinhHoaHong(giaBan: number, tyLeHoaHong: number): number {
  return lamTronVnd((giaBan * (tyLeHoaHong || 0)) / 100);
}

// Giải thích:
// Lãi gộp = giaBan - tongGiaVon - tienHoaHong. Hiện số lãi ở form và expand.
export function tinhLai(
  giaBan: number,
  tongGiaVon: number,
  tienHoaHong: number,
): number {
  return lamTronVnd(giaBan - tongGiaVon - tienHoaHong);
}

const PHAN_TRAM_HIEN_THI_TOI_DA = 999;

// Giải thích:
// Làm tròn % 2 chữ số. Trả null nếu số vô hạn hoặc quá lớn để hiện.
function sangPhanTramHienThi(giaTri: number): number | null {
  if (!Number.isFinite(giaTri)) return null;
  if (Math.abs(giaTri) > PHAN_TRAM_HIEN_THI_TOI_DA) return null;
  return Math.round(giaTri * 100) / 100;
}

// Giải thích:
// Biên lãi / giá bán = laiGop / giaBan * 100. Hiện "Biên lãi / giá bán" trên form.
export function tinhPhanTramBienLoiNhuan(
  giaBan: number,
  laiGop: number,
): number | null {
  if (!giaBan || giaBan <= 0) return null;
  return sangPhanTramHienThi((laiGop / giaBan) * 100);
}

// Giải thích:
// % lãi trên giá vốn = laiGop / tongGiaVon * 100. Hiện "% lãi / giá vốn" trên form.
export function tinhPhanTramLaiTrenVon(
  tongGiaVon: number,
  laiGop: number,
): number | null {
  if (!tongGiaVon || tongGiaVon <= 0) return null;
  return sangPhanTramHienThi((laiGop / tongGiaVon) * 100);
}

export type MauLai = "lai" | "hoa" | "lo";

// Giải thích:
// Phân loại lãi / hòa / lỗ theo lãi gộp. Dùng badge và màu chữ trên form + expand.
export function layMauLai(laiGop: number | null | undefined): MauLai {
  if (laiGop == null) return "hoa";
  if (laiGop > 0) return "lai";
  if (laiGop < 0) return "lo";
  return "hoa";
}

// Giải thích:
// Chữ trên badge: Lãi / Hòa / Lỗ.
export function layNhanLai(mauLai: MauLai): string {
  if (mauLai === "lai") return "Lãi";
  if (mauLai === "lo") return "Lỗ";
  return "Hòa";
}

// Giải thích:
// Class nền badge theo lãi / lỗ / hòa.
export function layClassBadgeLai(mauLai: MauLai): string {
  if (mauLai === "lai") {
    return "bg-state-success-bg text-state-success-text";
  }
  if (mauLai === "lo") {
    return "bg-state-danger-bg text-state-danger-text";
  }
  return "bg-kit-page text-kit-muted";
}

// Giải thích:
// Class màu chữ số lãi trên form.
export function layClassChuLai(mauLai: MauLai): string {
  if (mauLai === "lai") return "text-state-success-text";
  if (mauLai === "lo") return "text-state-danger-text";
  return "text-kit-muted";
}
