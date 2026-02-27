/**
 * Validate FormData types to prevent casting bypasses
 */
export function validateFormData(data: unknown): data is FormData {
  return data instanceof FormData;
}

/**
 * Safely extract enum values from FormData
 */
export function extractEnumFromFormData<T extends string>(
  formData: FormData,
  key: string,
  allowedValues: T[]
): T | null {
  const value = formData.get(key);
  
  if (typeof value !== 'string') {
    return null;
  }

  if (!allowedValues.includes(value as T)) {
    return null;
  }

  return value as T;
}

/**
 * Validate JSON request body structure
 */
export function validateJsonBody<T>(body: unknown, validator: (obj: unknown) => obj is T): T | null {
  if (!validator(body)) {
    return null;
  }
  return body as T;
}

/**
 * Validate model selection
 */
export function isValidAIModel(model: unknown): model is 'gpt-4o-mini' | 'claude-haiku' | 'claude-sonnet' {
  return typeof model === 'string' && ['gpt-4o-mini', 'claude-haiku', 'claude-sonnet'].includes(model);
}

/**
 * Validate dialect
 */
export function isValidDialect(dialect: unknown, isSource: boolean): dialect is string {
  const dialects = isSource 
    ? ['sql_server', 'oracle', 'mysql', 'postgresql']
    : ['snowflake_dbt', 'bigquery', 'redshift', 'postgresql'];
  
  return typeof dialect === 'string' && dialects.includes(dialect);
}
