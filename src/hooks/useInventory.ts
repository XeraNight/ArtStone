"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { InventoryItem, InventoryCategory } from '@/types/database';

interface InventoryFilters {
  categoryId?: string;
  search?: string;
  lowStock?: boolean;
}

export function useInventoryCategories() {
  return useQuery({
    queryKey: ['inventory-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as InventoryCategory[];
    },
  });
}

export function useInventoryItems(filters?: InventoryFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inventory', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('inventory_items')
          .select(`
            *,
            category:inventory_categories(id, name)
          `)
          .order('name');

        if (filters?.categoryId) {
          query = query.eq('category_id', filters.categoryId);
        }
        if (filters?.search) {
          query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('[Supabase Query Error] fetching inventory_items:', error);
          throw error;
        }

        let items = data as any[];

        // Filter low stock items client-side
        if (filters?.lowStock) {
          items = items.filter(item => ((item.qty_available || 0) - (item.qty_reserved || 0)) < (item.min_stock || 0));
        }

        return items as InventoryItem[];
      } catch (err) {
        console.error('[React Query Error] fetching inventory_items:', err);
        throw err;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache to prevent lag
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          category:inventory_categories(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as InventoryItem;
    },
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Partial<InventoryItem>) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          name: item.name!,
          sku: item.sku!,
          category_id: item.category_id,
          qty_available: item.qty_available || 0,
          qty_reserved: 0,
          min_stock: item.min_stock || 0,
          purchase_price: item.purchase_price,
          sale_price: item.sale_price,
          notes: item.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', data.id] });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, forceDelete = false }: { id: string; forceDelete?: boolean }) => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useCreateInventoryCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('inventory_categories')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, adjustment }: { itemId: string; adjustment: number }) => {
      // Get current stock
      const { data: current, error: fetchError } = await supabase
        .from('inventory_items')
        .select('qty_available')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;

      const newQty = Math.max(0, (current.qty_available || 0) + adjustment);

      const { data, error } = await supabase
        .from('inventory_items')
        .update({ qty_available: newQty, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useInventoryReservations(itemId: string) {
  return useQuery({
    queryKey: ['inventory-reservations', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          client:clients(id, contact_name, company_name),
          quote:quotes(id, quote_number)
        `)
        .eq('inventory_item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!itemId,
  });
}
