// Enrollment ID Storage Manager
// Manages enrollment ID in browser localStorage

const STORAGE_KEY = 'wtl_enrollment_id';

export const EnrollmentStorage = {
  /**
   * Get stored enrollment ID
   */
  get(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
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
      localStorage.setItem(STORAGE_KEY, enrollmentId);
    } catch (error) {
      console.error('Failed to store enrollment ID:', error);
    }
  },

  /**
   * Remove stored enrollment ID
   */
  remove(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
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

