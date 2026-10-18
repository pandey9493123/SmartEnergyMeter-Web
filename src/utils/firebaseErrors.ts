export function getFirebaseErrorCode(
  error: unknown,
): string | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  if (!('code' in error)) {
    return undefined;
  }

  const possibleCode = (error as { code?: unknown }).code;

  return typeof possibleCode === 'string'
    ? possibleCode
    : undefined;
}