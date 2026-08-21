import { StaffSalonTable } from "@/features/salons/components/StaffSalonTable";

interface StaffSalonPageProps {
  salonId: number;
}

export function StaffSalonPage({ salonId }: StaffSalonPageProps) {
  return <StaffSalonTable salonId={salonId} />;
}
