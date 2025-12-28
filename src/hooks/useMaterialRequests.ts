import { useQuery } from '@tanstack/react-query';
import { materialService } from '@/services/materialService';
import type { RequestStatus } from '@/types/database';

export function useMaterialRequests(statusFilter?: RequestStatus) {
  return useQuery({
    queryKey: ['material_requests', statusFilter],
    queryFn: () => materialService.getRequests(statusFilter),
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: materialService.getProjects,
  });
}