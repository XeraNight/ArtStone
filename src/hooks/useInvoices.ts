"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Invoice, InvoiceStatus } from '@/types/database';

interface InvoiceFilters {
  status?: InvoiceStatus;
  clientId?: string;
  search?: string;
}

export function useInvoices(filters?: InvoiceFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      let data: Invoice[] = [];

      const { data: dbData, error } = await supabase
        .from('invoices')
        .select(`
            *,
            client:clients(id, contact_name, company_name)
          `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading invoices:', error);
        throw error;
      }

      data = dbData as Invoice[];

      if (filters?.status) {
        data = data.filter(i => i.status === filters.status);
      }
      if (filters?.clientId) {
        data = data.filter(i => i.client_id === filters.clientId);
      }
      if (filters?.search) {
        data = data.filter(i => i.invoice_number.toLowerCase().includes(filters.search!.toLowerCase()));
      }

      return data;
    },
    enabled: !!user && (user.role === 'admin' || user.role === 'manager'),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(id, contact_name, company_name, email, phone, address),
          items:invoice_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    enabled: !!id,
  });
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`);

  const number = (count || 0) + 1;
  return `FA-${year}-${number.toString().padStart(4, '0')}`;
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (invoice: {
      client_id: string;
      quote_id?: string;
      due_date?: string;
      notes?: string;
      items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        inventory_item_id?: string;
      }>;
    }) => {
      const invoiceNumber = await generateInvoiceNumber();

      // Calculate totals
      const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const taxRate = 20;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          client_id: invoice.client_id,
          quote_id: invoice.quote_id,
          status: 'draft',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: invoice.due_date,
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
          notes: invoice.notes,
          created_by: user?.id,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert items
      const itemsToInsert = invoice.items.map(item => ({
        invoice_id: invoiceData.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
        inventory_item_id: item.inventory_item_id,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return invoiceData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, status }: { invoiceId: string; status: InvoiceStatus }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useCreateInvoiceFromQuote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      // Fetch quote with items
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*, items:quote_items(*)')
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;

      const invoiceNumber = await generateInvoiceNumber();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days payment term

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          client_id: quote.client_id,
          quote_id: quoteId,
          status: 'draft',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          subtotal: quote.subtotal,
          tax_rate: quote.tax_rate,
          tax_amount: quote.tax_amount,
          total: quote.total,
          notes: quote.notes,
          created_by: user?.id,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Copy items from quote
      if (quote.items && quote.items.length > 0) {
        const itemsToInsert = quote.items.map((item: any) => ({
          invoice_id: invoiceData.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          inventory_item_id: item.inventory_item_id,
        }));

        await supabase.from('invoice_items').insert(itemsToInsert);
      }

      return invoiceData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoice: {
      id: string;
      client_id: string;
      due_date?: string;
      status?: InvoiceStatus;
      notes?: string;
      items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        inventory_item_id?: string;
      }>;
    }) => {
      // 1. Update Invoice Details
      const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const taxRate = 20;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      const { data: updatedInvoice, error: updateError } = await supabase
        .from('invoices')
        .update({
          client_id: invoice.client_id,
          due_date: invoice.due_date,
          status: invoice.status,
          notes: invoice.notes,
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoice.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // 2. Delete existing items
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoice.id);

      if (deleteError) throw deleteError;

      // 3. Insert new items
      if (invoice.items.length > 0) {
        const itemsToInsert = invoice.items.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          inventory_item_id: item.inventory_item_id,
        }));

        const { error: insertError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (insertError) throw insertError;
      }

      return updatedInvoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', data.id] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete items first (should cascade, but just in case)
      await supabase.from('invoice_items').delete().eq('invoice_id', id);

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
