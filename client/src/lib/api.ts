// API Client for Weight Loss Agent Backend
import { EnrollmentStorage, PatientStorage } from './enrollment-storage';
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

// ===========================================
// INTAKE API - Exercise, Fitness, Willingness
// ===========================================

export interface AvailabilityWindow {
  day_of_week: string;
  start_local_time: string;
  end_local_time: string;
}

export interface IntensityPreference {
  floor_rpe: number;
  ceiling_rpe: number;
  notes?: string;
}

export interface ExercisePreferencesCreate {
  patient_id: string;
  preferred_modalities: string[];
  avoid_modalities: string[];
  weekly_session_target: number;
  session_length_minutes: number;
  availability: AvailabilityWindow[];
  environments: string[];
  equipment_available: string[];
  intensity_preference?: IntensityPreference;
  barriers: string[];
  motivators: string[];
  caregiver_notes?: string;
}

export interface ExercisePreferencesRecord extends ExercisePreferencesCreate {
  preference_id: string;
  created_at: string;
  updated_at: string;
  version: string;
  provenance: Record<string, any>;
}

export interface MedicalFlag {
  code: string;
  description: string;
  severity?: string;
}

export interface FitnessScreenCreate {
  patient_id: string;
  resting_hr?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  waist_circumference_cm?: number;
  vo2_proxy?: number;
  orthopedic_flags: MedicalFlag[];
  cardiometabolic_flags: MedicalFlag[];
  clearance_required: boolean;
  risk_category?: string;
  notes?: string;
}

export interface FitnessScreenRecord extends FitnessScreenCreate {
  screen_id: string;
  screened_at: string;
  version: string;
  provenance: Record<string, any>;
}

export interface WillingnessCommitmentCreate {
  patient_id: string;
  readiness_stage: string;
  commitment_score: number;
  weekly_minutes_promised: number;
  motivator_statement?: string;
  limiting_factors: string[];
  accountability_preferences: string[];
  confidence_rating: number;
  support_contacts: string[];
  follow_up_interval_days: number;
}

export interface WillingnessCommitmentRecord extends WillingnessCommitmentCreate {
  willingness_id: string;
  captured_at: string;
  version: string;
  provenance: Record<string, any>;
}

export async function submitExercisePreferences(payload: ExercisePreferencesCreate): Promise<ExercisePreferencesRecord> {
  return fetchAPI<ExercisePreferencesRecord>('/intake/exercise-preferences', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitFitnessScreen(payload: FitnessScreenCreate): Promise<FitnessScreenRecord> {
  return fetchAPI<FitnessScreenRecord>('/intake/fitness-screen', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitWillingnessCommitment(payload: WillingnessCommitmentCreate): Promise<WillingnessCommitmentRecord> {
  return fetchAPI<WillingnessCommitmentRecord>('/intake/willingness', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ===========================================
// PLAN API - Plan Generation and Retrieval
// ===========================================

export interface PlanMetricRange {
  metric_id: string;
  label: string;
  min_value?: number;
  max_value?: number;
  units: string;
  cadence: string;
  sources: string[];
}

export interface HabitFocus {
  habit_id: string;
  description: string;
  cue: string;
  measurement: string;
  sources: string[];
  priority: number;
}

export interface SafetyRuleCap {
  rule_id: string;
  action: string;
  rationale_ids: string[];
  severity: string;
  cap_value?: number;
  units?: string;
}

export interface PlanSnapshot {
  plan_id: string;
  user_id: string;
  generated_at: string;
  review_after_days: number;
  valid_from: string;
  valid_to: string;
  targets: Record<string, PlanMetricRange>;
  hydration: PlanMetricRange;
  habits_focus: HabitFocus[];
  safety_rules: SafetyRuleCap[];
  sources: string[];
  provenance: Record<string, string>;
  abstained: boolean;
  abstain_reason?: string;
}

export interface PlanGenerateRequest {
  user_id: string;
  enrollment_id?: string;
  include_context?: boolean;
}

export interface PlanGenerateResponse {
  plan_snapshot?: PlanSnapshot;
  abstained: boolean;
  reason?: string;
  ai_recommendations?: Record<string, any>;
}

export async function generatePlan(payload: PlanGenerateRequest): Promise<PlanGenerateResponse> {
  return fetchAPI<PlanGenerateResponse>('/plan/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCurrentPlan(userId: string): Promise<PlanSnapshot> {
  return fetchAPI<PlanSnapshot>(`/plan/current?user_id=${userId}`);
}

// ===========================================
// COACH API - Coach Messenger
// ===========================================

export interface CoachActionRequest {
  user_id: string;
  context_tags: string[];
  trigger: string;
  plan_id?: string;
}

export interface SuggestionCard {
  card_id: string;
  user_id: string;
  card_type: string;
  title: string;
  body: string;
  cta?: string;
  context_tags: string[];
  sources: string[];
  confidence: number;
  abstained: boolean;
  abstain_reason?: string;
  created_at: string;
  provenance: Record<string, any>;
}

export interface CoachActionResponse {
  cards: SuggestionCard[];
  abstained: boolean;
  reason?: string;
}

export async function getCoachAction(payload: CoachActionRequest): Promise<CoachActionResponse> {
  return fetchAPI<CoachActionResponse>('/coach/act', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ===========================================
// SAFETY API - Safety Rules Validation
// ===========================================

export interface SafetyValidationRequest {
  user_id: string;
  medications: string[];
  conditions: Record<string, any>;
  inbody: Record<string, any>;
  fitness: Record<string, any>;
  willingness: Record<string, any>;
}

export interface SafetyAction {
  rule_id: string;
  type: string;
  metric?: string;
  value?: number;
  units?: string;
  severity: string;
  rationale_source_id?: string;
}

export interface SafetyValidationResponse {
  contraindications: SafetyAction[];
  intensity_caps: SafetyAction[];
  rationale_ids: string[];
}

export async function validateSafety(payload: SafetyValidationRequest): Promise<SafetyValidationResponse> {
  return fetchAPI<SafetyValidationResponse>('/safety/validate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ===========================================
// SYMPTOMS API - GLP-1 Weekly Symptoms
// ===========================================

export interface SymptomEntry {
  name: string;
  severity_grade: number;
  days_reported: number;
  notes?: string;
}

export interface WeeklySymptomsCreate {
  user_id: string;
  medication_name?: string;
  medication_dose_mg?: number;
  week_start: string;
  week_end: string;
  symptoms: SymptomEntry[];
  fasting_bg_events: number;
  hypoglycemia_events: number;
  insulin_or_sulfonylurea: boolean;
  notes?: string;
}

export interface WeeklySymptomsRecord extends WeeklySymptomsCreate {
  record_id: string;
  captured_at: string;
  severity_grade_overall: number;
  escalation_triggered: boolean;
  escalation_reason?: string;
  provenance: Record<string, any>;
}

export async function logWeeklySymptoms(payload: WeeklySymptomsCreate): Promise<WeeklySymptomsRecord> {
  return fetchAPI<WeeklySymptomsRecord>('/symptoms/weekly', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Get enrollment ID from storage or throw error
export function getEnrollmentId(): string {
  const enrollmentId = EnrollmentStorage.get();
  if (!enrollmentId) {
    throw new Error('No enrollment ID found. Please enter your Patient ID.');
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
  PatientStorage.remove();
}

// Check if enrollment ID exists
export function hasEnrollmentId(): boolean {
  return EnrollmentStorage.has();
}

// Get patient ID from storage
export function getPatientId(): string | null {
  return PatientStorage.get();
}

// Set patient ID in storage
export function setPatientId(patientId: string): void {
  PatientStorage.set(patientId);
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
  return fetchAPI<WeightLossEnrollment>(`/weight-loss-agent/patient/${patientId}/enrollment/public`);
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

