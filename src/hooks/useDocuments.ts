"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Document, DocumentCategory, AppRole } from '@/types/database';

interface DocumentFilters {
  category?: DocumentCategory;
  search?: string;
}

export function useDocuments(filters?: DocumentFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['documents', filters],
    queryFn: async () => {
      let data: Document[] = [];

      console.log('Fetching documents from Supabase...');
      let query = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data: dbData, error } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      // Fetch all users to map names
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      // Create a map of user IDs to names
      const userMap = new Map(users?.map(u => [u.id, u.full_name || u.email || 'Neznámy']) || []);

      // Map documents with user names
      data = (dbData || []).map(doc => ({
        ...doc,
        created_by_user: {
          id: doc.created_by,
          full_name: userMap.get(doc.created_by) || 'Neznámy používateľ',
          email: '',
          phone: null,
          avatar_url: null,
          region_id: null,
          theme_preference: 'system' as const,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })) as Document[];

      return data;
    },
    enabled: !!user,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          created_by_user:profiles!documents_created_by_fkey(id, full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Document;
    },
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (document: {
      title: string;
      category: DocumentCategory;
      file_url: string;
      file_type?: string;
      file_size?: string;
      allowed_roles?: AppRole[];
      allowed_user_ids?: string[];
    }) => {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: document.title,
          category: document.category,
          file_url: document.file_url,
          file_type: document.file_type,
          file_size: document.file_size,
          allowed_roles: document.allowed_roles || ['admin', 'manager', 'sales'],
          allowed_user_ids: document.allowed_user_ids || [],
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Document> & { id: string }) => {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', data.id] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        fileName: file.name,
        fileType: fileExt || 'unknown',
        fileSize: formatFileSize(file.size),
      };
    },
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
