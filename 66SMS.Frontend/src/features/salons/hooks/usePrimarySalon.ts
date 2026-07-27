import { useQuery } from "@tanstack/react-query";
import { salonPublicApi } from "../api/salon.public.api";

export function usePrimarySalon() {
  return useQuery({
    queryKey: ["salons", "primary"] as const,
    queryFn: () => salonPublicApi.getPrimary(),
    staleTime: 5 * 60 * 1000,
  });
}
