"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

import type { Client, ClientStatus } from '@/types/database';

interface ClientFilters {
  status?: ClientStatus;
  regionId?: string;
  assignedUserId?: string;
  search?: string;
}

export function useClients(filters?: ClientFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients', filters],
    queryFn: async () => {
      let data: Client[] = [];
      console.log('useClients: fetching', { filters });

      const { data: dbData, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients from Supabase:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error;
      }
      console.log('useClients: fetched', dbData?.length, 'clients');
      data = dbData as Client[];

      if (filters?.status) {
        data = data.filter(c => c.status === filters.status);
      }
      if (filters?.regionId) {
        data = data.filter(c => c.region_id === filters.regionId);
      }
      if (filters?.assignedUserId) {
        data = data.filter(c => c.assigned_user_id === filters.assignedUserId);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        data = data.filter(c =>
          c.contact_name?.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search) ||
          c.company_name?.toLowerCase().includes(search)
        );
      }

      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
            *,
            assigned_user:profiles(id, full_name, email)
          `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Client;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (client: Partial<Client>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          contact_name: client.contact_name!,
          company_name: client.company_name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          postal_code: client.postal_code,
          region_id: client.region_id,
          status: client.status || 'prospect',
          notes: client.notes,
          assigned_user_id: client.assigned_user_id || user?.id,
          lead_origin_id: client.lead_origin_id,
          photo_url: client.photo_url || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase create client error:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('Client created successfully:', data.id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      // Get current client data first to check if assigned_user_id changed
      const { data: currentClient } = await supabase
        .from('clients')
        .select('assigned_user_id,contact_name,company_name')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('clients')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          photo_url: updates.photo_url !== undefined ? updates.photo_url : undefined,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create notification if assigned_user_id changed and it's not the current user
      if (
        updates.assigned_user_id &&
        currentClient?.assigned_user_id !== updates.assigned_user_id &&
        updates.assigned_user_id !== user?.id
      ) {
        await supabase.from('notifications').insert({
          user_id: updates.assigned_user_id,
          type: 'new_client',
          title: 'Nový klient priradený',
          message: `Klient ${currentClient?.contact_name || currentClient?.company_name || 'bol'} vám bol priradený`,
          entity_type: 'client',
          entity_id: id,
        });
      }

      return data;
    },
    onMutate: async (newClient: Partial<Client> & { id: string }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['clients'] });

      // Snapshot the previous value
      const previousQueries = queryClient.getQueriesData({ queryKey: ['clients'] });

      // Optimistically update to the new value in all matching queries
      queryClient.setQueriesData({ queryKey: ['clients'] }, (old: any) => {
        if (!old) return old;
        
        // Handle both list and single object queries
        if (Array.isArray(old)) {
          return old.map((client: Client) => 
            client.id === newClient.id ? { ...client, ...newClient } : client
          );
        }
        
        if (old.id === newClient.id) {
          return { ...old, ...newClient };
        }
        
        return old;
      });

      return { previousQueries };
    },
    onError: (err, newClient, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, queryData]) => {
          queryClient.setQueryData(queryKey, queryData);
        });
      }
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['clients', data.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useConvertLeadToClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (leadId: string) => {
      // Fetch the lead
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError) throw leadError;

      // Create client from lead
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          contact_name: lead.contact_name,
          company_name: lead.company_name,
          email: lead.email,
          phone: lead.phone,
          address: lead.address,
          postal_code: lead.postal_code,
          region_id: lead.region_id,
          status: 'active',
          assigned_user_id: lead.assigned_user_id,
          lead_origin_id: lead.id,
          notes: lead.notes,
          created_by: user?.id,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Update lead with converted_to_client_id
      await supabase
        .from('leads')
        .update({
          converted_to_client_id: client.id,
          status: 'won',
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId);

      // Log activity
      await supabase.from('activities').insert({
        entity_type: 'client',
        entity_id: client.id,
        activity_type: 'note',
        title: 'Klient vytvorený z leadu',
        description: `Klient bol vytvorený konverziou z leadu`,
        created_by: user?.id,
      });

      return client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAssignSalespersonToClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ clientId, salespersonId }: { clientId: string; salespersonId: string | null }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({ salesperson_id: salespersonId, updated_at: new Date().toISOString() })
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        entity_type: 'client',
        entity_id: clientId,
        activity_type: 'note',
        title: salespersonId ? 'Klient priradený obchodníkovi' : 'Klient odpojený od obchodníka',
        description: salespersonId ? 'Klient bol úspešne priradený obchodníkovi' : 'Priradenie obchodníkovi bolo zrušené',
        created_by: user?.id,
      });

      return data;
    },
    onMutate: async ({ clientId, salespersonId }) => {
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      const previousClients = queryClient.getQueryData<Client[]>(['clients']);
      
      if (previousClients) {
        queryClient.setQueryData(['clients'], (old: Client[] | undefined) => 
          old?.map((client) => (client.id === clientId ? { ...client, salesperson_id: salespersonId } : client))
        );
      }
      
      return { previousClients };
    },
    onError: (err, variables, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(['clients'], context.previousClients);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
