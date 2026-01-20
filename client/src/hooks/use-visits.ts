import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertVisit } from "@shared/schema";

export function useVisits() {
  return useQuery({
    queryKey: [api.visits.list.path],
    queryFn: async () => {
      const res = await fetch(api.visits.list.path);
      if (!res.ok) throw new Error("Failed to fetch visit history");
      return api.visits.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertVisit) => {
      const res = await fetch(api.visits.create.path, {
        method: api.visits.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.visits.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to record visit");
      }
      
      return api.visits.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.visits.list.path] });
    },
  });
}
