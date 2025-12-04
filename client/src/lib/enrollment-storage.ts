// Enrollment ID Storage Manager
// Manages enrollment ID and patient ID in browser localStorage

const ENROLLMENT_STORAGE_KEY = 'wtl_enrollment_id';
const PATIENT_STORAGE_KEY = 'wtl_patient_id';

export const EnrollmentStorage = {
  /**
   * Get stored enrollment ID
   */
  get(): string | null {
    try {
      return localStorage.getItem(ENROLLMENT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to get enrollment ID from storage:', error);
      return null;
    }
  },

  /**
   * Store enrollment ID
   */
  set(enrollmentId: string): void {
    try {
      localStorage.setItem(ENROLLMENT_STORAGE_KEY, enrollmentId);
    } catch (error) {
      console.error('Failed to store enrollment ID:', error);
    }
  },

  /**
   * Remove stored enrollment ID
   */
  remove(): void {
    try {
      localStorage.removeItem(ENROLLMENT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove enrollment ID:', error);
    }
  },

  /**
   * Check if enrollment ID is stored
   */
  has(): boolean {
    return this.get() !== null;
  },
};

export const PatientStorage = {
  /**
   * Get stored patient ID
   */
  get(): string | null {
    try {
      return localStorage.getItem(PATIENT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to get patient ID from storage:', error);
      return null;
    }
  },

  /**
   * Store patient ID
   */
  set(patientId: string): void {
    try {
      localStorage.setItem(PATIENT_STORAGE_KEY, patientId);
    } catch (error) {
      console.error('Failed to store patient ID:', error);
    }
  },

  /**
   * Remove stored patient ID
   */
  remove(): void {
    try {
      localStorage.removeItem(PATIENT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove patient ID:', error);
    }
  },

  /**
   * Check if patient ID is stored
   */
  has(): boolean {
    return this.get() !== null;
  },
};

