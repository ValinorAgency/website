// Rate limiting best-effort en memoria del proceso. Sirve para frenar
// reintentos y scripts simples, pero NO es un límite global confiable:
// en Vercel serverless cada instancia (y cada cold start) tiene su propia
// memoria, así que un mismo origen puede recibir cupos distintos según qué
// instancia atienda cada request. No reemplaza una solución centralizada
// (por ejemplo Redis) si en el futuro se necesita un límite garantizado.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_TRACKED_KEYS = 500;

const hits = new Map<string, number[]>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > MAX_TRACKED_KEYS) {
    for (const [trackedKey, timestamps] of hits) {
      if (timestamps.every((timestamp) => now - timestamp >= WINDOW_MS)) {
        hits.delete(trackedKey);
      }
    }
  }

  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Vercel (el hosting de destino, ver docs/ARCHITECTURE.md) reenvía la
    // request a la función serverless agregando la IP real del cliente al
    // FINAL de esta cabecera; cualquier valor que el propio cliente haya
    // mandado en su request queda antes de ese último tramo. Leer el primer
    // valor (como se hacía antes) confiaba en un dato que el atacante
    // controla directamente, y volvía este límite trivialmente evadible
    // rotando la cabecera en cada intento.
    const parts = forwardedFor.split(",").map((part) => part.trim()).filter(Boolean);
    const lastIp = parts[parts.length - 1];
    if (lastIp) return lastIp;
  }
  return "unknown";
}
