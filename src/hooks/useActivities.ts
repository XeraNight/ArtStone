"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Activity, ActivityType } from '@/types/database';

interface ActivityFilters {
  entityType?: 'lead' | 'client';
  entityId?: string;
  limit?: number;
}

// Custom Slovak relative time formatting
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Práve teraz';
  if (diffMins === 1) return 'Pred 1 minútou';
  if (diffMins < 5) return `Pred ${diffMins} minútami`;
  if (diffMins < 60) return `Pred ${diffMins} min`;
  if (diffHours === 1) return 'Pred 1 hodinou';
  if (diffHours < 24) return `Pred ${diffHours} hod`;
  if (diffDays === 1) return 'Pred 1 dňom';
  if (diffDays < 7) return `Pred ${diffDays} dňami`;
  if (diffDays < 14) return 'Pred týždňom';
  if (diffDays < 30) return `Pred ${Math.floor(diffDays / 7)} týždňami`;
  return date.toLocaleDateString('sk-SK');
}

export function useActivities(filters?: ActivityFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!user,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (activity: {
      entity_type: 'lead' | 'client';
      entity_id: string;
      activity_type: ActivityType;
      title: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          ...activity,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
    },
  });
}

export function useRecentActivities(limit = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-activities', limit, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Filter by user role if strictly needed, but roughly everyone sees activities for now
      // or we rely on RLS. If sales should only see their own, RLS handles it.
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      // Format activities with relative time in Slovak
      return (data || []).map((activity: any) => ({
        ...activity,
        type: activity.activity_type,
        time: formatRelativeTime(new Date(activity.created_at)),
        user: 'Používateľ', // Temporary - until we fix the FK issue or join profiles
      }));
    },
    enabled: !!user,
    refetchInterval: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
