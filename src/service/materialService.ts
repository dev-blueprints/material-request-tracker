import { supabase } from '@/lib/supabase';
import {  RequestStatus } from '@/types/database';

export const materialService = {
  
    // fetch all material requests with optional status filter
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

  //update material requests status
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

// fetch all projects
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }
};