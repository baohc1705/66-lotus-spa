import { useQuery } from "@tanstack/react-query";
import { salonPublicApi } from "../api/salon.public.api";

export const useActiveSalons = () => {
  return useQuery({
    queryKey: ["salons-active"],
    queryFn: salonPublicApi.getActive,
    staleTime: 5 * 60 * 1000,
  });
};
