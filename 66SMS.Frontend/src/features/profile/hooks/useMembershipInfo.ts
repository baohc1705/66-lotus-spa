import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { membershipTierApi } from "@/features/customers/api/membershipTier.api";

export function useMyMembershipCard(enabled = true) {
  return useQuery({
    queryKey: ["my-membership-card"],
    queryFn: async () => {
      const result = await profileApi.getMyMembershipCard();
      return result.data;
    },
    enabled,
    retry: false,
  });
}

export function useMembershipTiers() {
  return useQuery({
    queryKey: ["membership-tiers-list"],
    queryFn: async () => {
      const result = await membershipTierApi.getAll({ pageSize: 100 });
      return result.data?.items ?? [];
    },
  });
}

export function useMembershipTierDetail(id?: number) {
  return useQuery({
    queryKey: ["membership-tier-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const result = await membershipTierApi.getDetail(id);
      return result.data;
    },
    enabled: !!id,
  });
}
