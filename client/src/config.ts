/**
 * Application Configuration
 * 
 * Edit this file to configure the API endpoint for different environments.
 * No environment variables needed!
 */

/**
 * Get the API base URL based on the current environment
 * Always uses localhost:8000 as the backend server
 */
function getAPIBaseURL(): string {
  // Always connect to localhost:8000
  return 'http://localhost:8000';
}

export const config = {
  /**
   * Backend API Base URL
   * This is automatically configured based on environment
   */
  API_BASE_URL: getAPIBaseURL(),
  
  /**
   * App Configuration
   */
  APP_NAME: 'Weight Loss Dashboard',
  APP_VERSION: '1.0.0',
  
  /**
   * Feature Flags (optional)
   */
  FEATURES: {
    CHAT_ENABLED: true,
    REPORTS_UPLOAD_ENABLED: true,
    HEALTH_INDICATORS_ENABLED: true,
  },
} as const;

/**
 * For manual override during build/deployment:
 * Simply edit the return value in getAPIBaseURL() above
 * 
 * Examples:
 * - Production API: return 'https://api.myapp.com';
 * - Staging API: return 'https://staging-api.myapp.com';
 * - Same domain: return window.location.origin + '/api';
 * - Relative path: return '/api';
 */

export default config;

