/** Valor de `import.meta.env.VITE_API_BASE_URL`, sem barra final. */
export function getApiBaseUrl(): string | null {
  const u = import.meta.env.VITE_API_BASE_URL?.trim();
  return u || null;
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl() !== null;
}
