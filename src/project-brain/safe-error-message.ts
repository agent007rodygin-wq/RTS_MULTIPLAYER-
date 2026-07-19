export function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'symbol') {
    return error.toString();
  }
  try {
    return String(error);
  } catch {
    return 'An unknown error occurred.';
  }
}
