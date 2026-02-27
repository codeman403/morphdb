/**
 * Execute an async operation with a timeout
 * @param promise The promise to execute
 * @param timeoutMs Timeout in milliseconds
 * @param message Optional error message
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message = 'Operation timeout'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message)), timeoutMs)
    ),
  ]);
}
