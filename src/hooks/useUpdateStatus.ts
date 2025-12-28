import { useMutation, useQueryClient } from '@tanstack/react-query';
import { materialService } from '@/services/materialService';
import { MaterialRequest, RequestStatus } from '@/types/database';

export function useUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      materialService.updateStatus(id, status),
    
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['material_requests'] });

      const previousRequests = queryClient.getQueryData<MaterialRequest[]>(['material_requests']);

      queryClient.setQueryData(['material_requests'], (old: any) => 
        old?.map((req: MaterialRequest) => 
          req.id === id ? { ...req, status } : req
        )
      );

      return { previousRequests };
    },

    onError: (err, _, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(['material_requests'], context.previousRequests);
      }
      console.error("Update failed:", err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['material_requests'] });
    },
  });
}