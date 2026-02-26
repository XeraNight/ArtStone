"use client";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile, AppRole } from '@/types/database';

interface Salesperson extends Profile {
  role: AppRole;
  stats: {
    leads: number;
    clients: number;
    quotes: number;
    targetProgress?: number;
    conversionRate?: number;
  };
}

export function useSalespeople() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['salespeople'],
    queryFn: async () => {
      // Get profiles for sales users
      let query = supabase
        .from('profiles')
        .select(`
          *,
          regions(id, name)
        `)
        .eq('role', 'sales')
        .eq('is_active', true);

      // Manager can only see salespeople in their region
      if (user?.role === 'manager' && user.regionId) {
        query = query.eq('region_id', user.regionId);
      }

      const { data: profiles, error: profilesError } = await query;

      if (profilesError) throw profilesError;

      // Get stats for each salesperson
      const salespeopleWithStats: Salesperson[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [leadsResult, clientsResult, quotesResult] = await Promise.all([
            supabase
              .from('leads')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_user_id', profile.id),
            supabase
              .from('clients')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_user_id', profile.id),
            supabase
              .from('quotes')
              .select('*', { count: 'exact', head: true })
              .eq('created_by', profile.id),
          ]);

          // Mocking conversion and progress as it depends on more complex logic usually
          const leads = leadsResult.count || 0;
          const clients = clientsResult.count || 0;
          const conversionRate = leads > 0 ? Math.round((clients / leads) * 100) : 0;

          return {
            ...profile,
            role: 'sales' as AppRole,
            region: profile.regions,
            stats: {
              leads: leads,
              clients: clients,
              quotes: quotesResult.count || 0,
              conversionRate,
              targetProgress: Math.min(100, Math.round((clients / 10) * 100)) // Mock target
            },
          };
        })
      );

      return salespeopleWithStats;
    },
    enabled: !!user && (user.role === 'admin' || user.role === 'manager' || user.role === 'správca'),
  });
}
