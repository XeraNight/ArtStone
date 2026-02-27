"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FALLBACK_REGIONS } from '@/constants/regions';
import type { Region } from '@/types/database';

export function useRegions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['regions', 'v2'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('*')
          .order('name');

        if (error) {
           console.warn('[useRegions] Error fetching regions, using fallback:', error);
           return FALLBACK_REGIONS;
        }
        
        // If data is empty (likely due to RLS), return fallback
        if (!data || data.length === 0) {
           console.warn('[useRegions] No regions returned (RLS?), using fallback');
           return FALLBACK_REGIONS;
        }

        return data as Region[];
      } catch (err) {
        console.error('[useRegions] Exception:', err);
        return FALLBACK_REGIONS;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });
}

export function useCreateRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('regions')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
}
