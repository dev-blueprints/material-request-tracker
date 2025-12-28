import { supabase } from '@/lib/supabase';
import type { RequestStatus } from '@/types/database';

export const materialService = {

  async getRequests(statusFilter?: RequestStatus) {
    let query = supabase
      .from('material_requests')
      .select(`*, projects (name)`)
      .order('requested_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: RequestStatus) {
    const { data, error } = await supabase
      .from('material_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }
};