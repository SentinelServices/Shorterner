import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertSetting } from "@shared/schema";

export function useSetting(key: string) {
  return useQuery({
    queryKey: [api.settings.get.path, key],
    queryFn: async () => {
      const url = buildUrl(api.settings.get.path, { key });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch setting");
      return api.settings.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSetting) => {
      const res = await fetch(api.settings.update.path, {
        method: api.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update setting");
      }
      
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path, variables.key] });
    },
  });
}

export function useAnalyzeConnection() {
  return useQuery({
    queryKey: [api.analyze.get.path],
    queryFn: async () => {
      const res = await fetch(api.analyze.get.path);
      if (!res.ok) throw new Error("Failed to analyze connection");
      return api.analyze.get.responses[200].parse(await res.json());
    },
    enabled: false, // Only fetch on demand
  });
}
