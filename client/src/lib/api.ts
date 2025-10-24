// API Client for Weight Loss Agent Backend
import { EnrollmentStorage } from './enrollment-storage';
import { config } from '../config';

const API_BASE_URL = config.API_BASE_URL;

interface APIResponse<T> {
  status: string;
  message: string;
  data: T;
}

// Fetch with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result: APIResponse<T> = await response.json();
    return result.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Get enrollment ID from storage or throw error
export function getEnrollmentId(): string {
  const enrollmentId = EnrollmentStorage.get();
  if (!enrollmentId) {
    throw new Error('No enrollment ID found. Please enter your enrollment ID.');
  }
  return enrollmentId;
}

// Set enrollment ID in storage
export function setEnrollmentId(enrollmentId: string): void {
  EnrollmentStorage.set(enrollmentId);
}

// Remove enrollment ID from storage
export function clearEnrollmentId(): void {
  EnrollmentStorage.remove();
}

// Check if enrollment ID exists
export function hasEnrollmentId(): boolean {
  return EnrollmentStorage.has();
}

// API Functions

export interface ProgressDataPoint {
  date: string;
  weight?: number;
  bmi?: number;
  bodyFat?: number;
  meal_data?: any;
  fitness_data?: any;
  vitals_data?: any;
}

export interface LatestInBodyReport {
  report_id: string;
  report_date: string;
  processed: boolean;
  extraction_confidence?: number;
  abnormal_indicators_count: number;
  measurements_count: number;
  ai_summary?: string;
  original_filename?: string;
}

export interface WeightLossProgressReport {
  enrollment_id: string;
  patient_id: string;
  patient_name?: string;
  enrollment_date: string;
  is_active: boolean;
  target_weight_kg?: number;
  target_bmi?: number;
  program_goals?: string;
  latest_inbody_report?: LatestInBodyReport;
  daily_reports: ProgressDataPoint[];
  // Computed fields for convenience
  progress_data?: ProgressDataPoint[];
  current_weight_kg?: number;
  current_bmi?: number;
  weight_lost_kg?: number;
  progress_percentage?: number;
}

export async function getWeightLossProgress(
  enrollmentId?: string,
  startDate?: string,
  endDate?: string
): Promise<WeightLossProgressReport> {
  const id = enrollmentId || getEnrollmentId();
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const result = await fetchAPI<WeightLossProgressReport>(
    `/weight-loss-agent/enrollment/${id}/progress${query}`
  );
  
  // Map daily_reports to progress_data for backwards compatibility
  result.progress_data = result.daily_reports || [];
  
  return result;
}

export interface Measurement {
  measurement_id: string;
  report_id: string;
  measurement_type: string;
  value: number;
  unit: string;
  normal_min?: number;
  normal_max?: number;
  confidence_score: number;
  created_at: string;
}

export interface InBodyReport {
  report_id: string;
  enrollment_id: string;
  report_date: string;
  processed: boolean;
  extraction_confidence?: number | null;
  abnormal_indicators_count: number;
  measurements_count?: number;
  ai_summary?: string | null;
  original_filename?: string;
  file_path?: string;
  file_size?: number;
  content_type?: string;
  extracted_at?: string;
  created_at: string;
  measurements?: Measurement[];
  health_indicators?: HealthIndicator[];
}

export async function getInBodyReports(enrollmentId?: string): Promise<InBodyReport[]> {
  const id = enrollmentId || getEnrollmentId();
  return fetchAPI<InBodyReport[]>(`/weight-loss-agent/enrollment/${id}/inbody-reports`);
}

export interface HealthIndicator {
  indicator_id: string;
  report_id: string;
  indicator_name: string;
  indicator_type: string;
  value: number;
  unit: string;
  is_abnormal: boolean;
  abnormality_level?: string;
  normal_range_min?: number;
  normal_range_max?: number;
  analysis_explanation?: string;
  recommendations?: string;
}

export async function getHealthIndicators(
  enrollmentId: string,
  reportId: string
): Promise<HealthIndicator[]> {
  return fetchAPI<HealthIndicator[]>(
    `/weight-loss-agent/enrollment/${enrollmentId}/inbody-report/${reportId}/health-indicators`
  );
}

export async function uploadInBodyReport(
  enrollmentId: string,
  file: File
): Promise<any> {
  const formData = new FormData();
  formData.append('report_file', file);

  const url = `${API_BASE_URL}/weight-loss-agent/enrollment/${enrollmentId}/inbody-report`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result: APIResponse<any> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  timestamp: string;
}

export async function chatWithAgent(
  enrollmentId: string,
  question: string,
  conversationId?: string
): Promise<ChatResponse> {
  return fetchAPI<ChatResponse>(
    `/weight-loss-agent/enrollment/${enrollmentId}/chat`,
    {
      method: 'POST',
      body: JSON.stringify({
        question,
        conversation_id: conversationId,
      }),
    }
  );
}

export interface WeightLossEnrollment {
  enrollment_id: string;
  patient_id: string;
  enrolled_by_care_provider_id: string;
  enrollment_date: string;
  is_active: boolean;
  program_goals?: string;
  target_weight_kg?: number;
  target_bmi?: number;
  initial_weight_kg?: number;
  initial_bmi?: number;
  created_at: string;
}

export async function getPatientEnrollment(patientId: string): Promise<WeightLossEnrollment> {
  return fetchAPI<WeightLossEnrollment>(`/weight-loss-agent/patient/${patientId}/enrollment`);
}

export async function getEnrollment(enrollmentId?: string): Promise<WeightLossEnrollment> {
  const id = enrollmentId || getEnrollmentId();
  const progress = await getWeightLossProgress(id);
  return {
    enrollment_id: id,
    patient_id: progress.patient_id,
    enrolled_by_care_provider_id: '',
    enrollment_date: progress.enrollment_date,
    is_active: progress.is_active,
    program_goals: progress.program_goals,
    target_weight_kg: progress.target_weight_kg,
    target_bmi: progress.target_bmi,
    created_at: progress.enrollment_date,
  };
}

