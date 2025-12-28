export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Unit = 'kg' | 'm' | 'pieces' | 'boxes';

export interface MaterialRequest {
  id: string;
  project_id: string | null;
  material_name: string;
  quantity: number;
  unit: Unit;
  status: RequestStatus;
  priority: Priority;
  requested_by: string;
  requested_at: string;
  notes?: string;
  company_id: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: 'manager' | 'worker';
  company_id: string;
}