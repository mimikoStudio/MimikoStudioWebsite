/**
 * Unified error logging utility
 * Provides consistent error logging across the application
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  productId?: string;
  orderId?: string;
  [key: string]: any;
}

/**
 * Log error with context
 */
export function logError(
  message: string,
  error?: any,
  context?: ErrorContext,
  severity: ErrorSeverity = 'error'
) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    severity,
    message,
    error: error ? {
      message: error.message,
      name: error.name,
      stack: error.stack,
      details: error.details,
      hint: error.hint,
      code: error.code,
    } : null,
    context: context || {},
  };

  // Log to console with appropriate level
  switch (severity) {
    case 'info':
      console.info('[INFO]', errorInfo);
      break;
    case 'warning':
      console.warn('[WARNING]', errorInfo);
      break;
    case 'critical':
      console.error('[CRITICAL]', errorInfo);
      break;
    default:
      console.error('[ERROR]', errorInfo);
  }

  // In production, you could send to error tracking service
  // Example: Sentry.captureException(error, { contexts: { custom: errorInfo } });
}

/**
 * Log Supabase error with detailed context
 */
export function logSupabaseError(
  operation: string,
  table: string,
  error: any,
  additionalContext?: ErrorContext
) {
  logError(
    `Supabase ${operation} failed on table "${table}"`,
    error,
    {
      operation,
      table,
      errorMessage: error.message,
      errorCode: error.code,
      errorDetails: error.details,
      errorHint: error.hint,
      ...additionalContext,
    },
    'error'
  );
}

/**
 * Log image loading error
 */
export function logImageError(
  imageUrl: string,
  context?: string,
  error?: any
) {
  logError(
    `Failed to load image: ${imageUrl.substring(0, 100)}...`,
    error,
    {
      imageUrl: imageUrl.substring(0, 200),
      context,
      imageLength: imageUrl.length,
      imageFormat: imageUrl.startsWith('') ? 'base64' : 'url',
    },
    'warning'
  );
}

/**
 * Log stock validation error
 */
export function logStockError(
  productId: string,
  requested: number,
  available: number,
  context?: string
) {
  logError(
    `Stock validation failed for product ${productId}`,
    null,
    {
      productId,
      requested,
      available,
      context,
      difference: requested - available,
    },
    'warning'
  );
}

/**
 * Log settings update error
 */
export function logSettingsError(
  settingKey: string,
  error: any,
  context?: ErrorContext
) {
  logError(
    `Failed to update setting: ${settingKey}`,
    error,
    {
      settingKey,
      ...context,
    },
    'error'
  );
}

/**
 * Log order creation error
 */
export function logOrderError(
  orderId: string | undefined,
  error: any,
  context?: ErrorContext
) {
  logError(
    `Order creation failed${orderId ? ` for order ${orderId}` : ''}`,
    error,
    {
      orderId,
      ...context,
    },
    'error'
  );
}

/**
 * Create user-friendly error message
 */
export function getUserFriendlyError(error: any): string {
  if (!error) return 'An unexpected error occurred';

  // Supabase errors
  if (error.message?.includes('row-level security')) {
    return 'Access denied. Please check your permissions.';
  }

  if (error.message?.includes('value too long')) {
    return 'Data is too large. Please reduce the size and try again.';
  }

  if (error.code === 'PGRST116') {
    return 'The requested data was not found.';
  }

  if (error.code === '23505') {
    return 'This item already exists. Please use a different name.';
  }

  // Network errors
  if (error.message?.includes('Failed to fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Image errors
  if (error.message?.includes('image')) {
    return 'Failed to load image. Please try again later.';
  }

  // Default
  return error.message || 'An error occurred. Please try again.';
}
