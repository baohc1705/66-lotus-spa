import { useQuery } from '@tanstack/react-query'
import { profileApi } from '../api/profile.api'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const result = await profileApi.getProfile()
      return result.data
    },
  })
}
