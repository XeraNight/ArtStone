"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

import type { Lead, LeadStatus, LeadSource } from '@/types/database';

interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  regionId?: string;
  assignedUserId?: string;
  salespersonId?: string;
  search?: string;
}

export function useLeads(filters?: LeadFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      let data: Lead[] = [];
      console.log('useLeads: fetching leads');

      const { data: dbData, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useLeads: Error fetching leads from Supabase', {
          error,
          code: error.code,
          message: error.message,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('useLeads: Successfully fetched', dbData?.length, 'leads');
      data = dbData as Lead[];

      if (filters?.status) {
        data = data.filter(l => l.status === filters.status);
      }
      if (filters?.source) {
        data = data.filter(l => l.source_type === filters.source);
      }
      if (filters?.regionId) {
        data = data.filter(l => l.region_id === filters.regionId);
      }
      if (filters?.assignedUserId) {
        data = data.filter(l => l.assigned_user_id === filters.assignedUserId);
      }
      if (filters?.salespersonId) {
        data = data.filter(l => l.salesperson_id === filters.salespersonId);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        data = data.filter(l =>
          l.contact_name?.toLowerCase().includes(search) ||
          l.email?.toLowerCase().includes(search) ||
          l.company_name?.toLowerCase().includes(search)
        );
      }
      return data;
    },
    enabled: !!user,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          region:regions(id, name),
          assigned_user:profiles!leads_assigned_user_id_fkey(id, full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Lead;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (lead: Partial<Lead>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          contact_name: lead.contact_name!,
          company_name: lead.company_name,
          email: lead.email,
          phone: lead.phone,
          address: lead.address,
          postal_code: lead.postal_code,
          region_id: lead.region_id,
          status: lead.status || 'new',
          source_type: lead.source_type || 'manual',
          priority: lead.priority || 'none',
          notes: lead.notes,
          photo_url: lead.photo_url,
          assigned_user_id: lead.assigned_user_id || user?.id,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase create lead error:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('Lead created successfully:', data.id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['recent-leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Mutation create lead error:', error);
    }
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update lead error:', error);
        throw error;
      }
      return data;
    },
    onMutate: async (newLead) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);
      
      if (previousLeads) {
        queryClient.setQueryData(['leads'], (old: Lead[] | undefined) => 
          old?.map((lead) => (lead.id === newLead.id ? { ...lead, ...newLead } : lead))
        );
      }
      
      return { previousLeads };
    },
    onError: (error, newLead, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
      console.error('Mutation update lead error:', error);
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['leads', data.id] });
      }
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAssignLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ leadId, userId }: { leadId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ assigned_user_id: userId, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        entity_type: 'lead',
        entity_id: leadId,
        activity_type: 'note',
        title: 'Lead priradený',
        description: `Lead bol priradený novému obchodníkovi`,
        created_by: user?.id,
      });

      // Create notification if assigned to someone else (not the current user)
      if (userId && userId !== user?.id) {
        // Get lead details for notification
        const { data: leadData } = await supabase
          .from('leads')
          .select('contact_name,company_name')
          .eq('id', leadId)
          .single();

        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'new_lead',
          title: 'Nový lead priradený',
          message: `Lead ${leadData?.contact_name || leadData?.company_name || ''} vám bol priradený`,
          entity_type: 'lead',
          entity_id: leadId,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ leadId, status, note }: { leadId: string; status: LeadStatus; note?: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        entity_type: 'lead',
        entity_id: leadId,
        activity_type: 'status_change',
        title: 'Zmena statusu',
        description: note || `Status zmenený na: ${status}`,
        created_by: user?.id,
      });

      return data;
    },
    onMutate: async ({ leadId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);
      
      if (previousLeads) {
        queryClient.setQueryData(['leads'], (old: Lead[] | undefined) => 
          old?.map((lead) => (lead.id === leadId ? { ...lead, status } : lead))
        );
      }
      
      return { previousLeads };
    },
    onError: (err, variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useUnassignLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ assigned_user_id: null, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        entity_type: 'lead',
        entity_id: leadId,
        activity_type: 'note',
        title: 'Priradenie zrušené',
        description: 'Lead bol oddelený od obchodníka',
        created_by: user?.id,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (leadId: string) => {
      // 1. Fetch the full lead data
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError) throw leadError;
      if (!lead) throw new Error('Lead not found');

      // Check if already converted
      if (lead.converted_to_client_id) {
        throw new Error('Tento lead už bol konvertovaný na klienta');
      }

      // 2. Check for duplicate client (by email)
      if (lead.email) {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id, contact_name')
          .eq('email', lead.email)
          .single();

        if (existingClient) {
          throw new Error(`Klient s emailom ${lead.email} už existuje`);
        }
      }

      // 3. Create new client from lead data
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          contact_name: lead.contact_name,
          company_name: lead.company_name,
          email: lead.email,
          phone: lead.phone,
          address: lead.address,
          postal_code: lead.postal_code,
          region_id: lead.region_id,
          assigned_user_id: lead.assigned_user_id,
          notes: lead.notes,
          photo_url: lead.photo_url,
          status: 'active', // New clients start as active
          converted_from_lead_id: lead.id,
          created_by: user?.id,
        })
        .select()
        .single();

      if (clientError) {
        console.error('Error creating client:', clientError);
        throw clientError;
      }

      // 4. Copy all activities from lead to client
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('entity_type', 'lead')
        .eq('entity_id', leadId);

      if (!activitiesError && activities && activities.length > 0) {
        // Create new activities for the client
        const clientActivities = activities.map(activity => ({
          entity_type: 'client' as const,
          entity_id: newClient.id,
          activity_type: activity.activity_type,
          title: activity.title,
          description: activity.description,
          created_by: activity.created_by,
          created_at: activity.created_at,
        }));

        await supabase.from('activities').insert(clientActivities);
      }

      // 5. Update lead with conversion info
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          converted_to_client_id: newClient.id,
          converted_at: new Date().toISOString(),
          status: 'won', // Mark lead as won
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId);

      if (updateError) {
        console.error('Error updating lead:', updateError);
        // Don't throw here, client was created successfully
      }

      // 6. Log conversion activity on the client
      await supabase.from('activities').insert({
        entity_type: 'client',
        entity_id: newClient.id,
        activity_type: 'note',
        title: 'Klient vytvorený z leadu',
        description: `Klient bol úspešne konvertovaný z leadu "${lead.contact_name}"`,
        created_by: user?.id,
      });

      return {
        client: newClient,
        lead: lead,
        activitiesCopied: activities?.length || 0,
      };
    },
    onSuccess: (data) => {
      // Invalidate all relevant caches
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-leads'] });
    },
    onError: (error) => {
      console.error('Lead conversion error:', error);
    },
  });
}

export function useAssignClientToLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ leadId, clientId }: { leadId: string; clientId: string | null }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ client_id: clientId, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        entity_type: 'lead',
        entity_id: leadId,
        activity_type: 'note',
        title: clientId ? 'Lead priradený ku klientovi' : 'Lead odpojený od klienta',
        description: clientId ? 'Lead bol úspešne priradený k existujúcemu klientovi' : 'Priradenie ku klientovi bolo zrušené',
        created_by: user?.id,
      });

      return data;
    },
    onMutate: async ({ leadId, clientId }) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);
      
      if (previousLeads) {
        queryClient.setQueryData(['leads'], (old: Lead[] | undefined) => 
          old?.map((lead) => (lead.id === leadId ? { ...lead, client_id: clientId } : lead))
        );
      }
      
      return { previousLeads };
    },
    onError: (err, variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useAssignSalespersonToLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ leadId, salespersonId }: { leadId: string; salespersonId: string | null }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ salesperson_id: salespersonId, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        entity_type: 'lead',
        entity_id: leadId,
        activity_type: 'note',
        title: salespersonId ? 'Lead priradený obchodníkovi' : 'Lead odpojený od obchodníka',
        description: salespersonId ? 'Lead bol úspešne priradený obchodníkovi' : 'Priradenie obchodníkovi bolo zrušené',
        created_by: user?.id,
      });

      return data;
    },
    onMutate: async ({ leadId, salespersonId }) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);
      
      if (previousLeads) {
        queryClient.setQueryData(['leads'], (old: Lead[] | undefined) => 
          old?.map((lead) => (lead.id === leadId ? { ...lead, salesperson_id: salespersonId } : lead))
        );
      }
      
      return { previousLeads };
    },
    onError: (err, variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
