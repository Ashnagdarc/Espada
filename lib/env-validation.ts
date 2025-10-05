/**
 * Environment variable validation utility
 * Ensures all required environment variables are properly configured
 */

interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET?: string;
  NODE_ENV: string;
}

/**
 * Validates required environment variables
 * Throws an error if any required variables are missing or invalid
 */
export function validateEnvironment(): EnvConfig {
  const errors: string[] = [];

  // Required Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
  }

  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  } else if (supabaseAnonKey.length < 100) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required');
  } else if (supabaseServiceKey.length < 100) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY appears to be invalid (too short)');
  }

  // JWT Secret validation (optional but recommended)
  const jwtSecret = process.env.JWT_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long for security');
  }

  // Node environment
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map(err => `  - ${err}`).join('\n')}\n\n` +
      'Please check your .env file and ensure all required variables are set correctly.\n' +
      'See .env.example for reference.'
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey!,
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey!,
    JWT_SECRET: jwtSecret,
    NODE_ENV: nodeEnv
  };
}

/**
 * Validates environment on application startup
 * Call this in your main application entry point
 */
export function validateEnvironmentOnStartup(): void {
  try {
    validateEnvironment();
    console.log('✅ Environment validation passed');
  } catch (error) {
    console.error('❌ Environment validation failed:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}