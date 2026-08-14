import type { AccessToken } from "@video-streaming/common";
import { env } from "../config/env.js";

/**
 * The identity headers the gateway stamps on every proxied request. Downstream
 * services authenticate off these, so search-service has to pass them along
 * rather than call upstreams anonymously.
 */
export function identityHeaders(user: AccessToken): Record<string, string> {
  return {
    "x-user-id": user.uid,
    "x-email": user.email || "",
    "x-role": user.role || "user",
  };
}

/**
 * GET a JSON document from a sibling service.
 *
 * Throws on anything that is not a 2xx so the caller can decide whether the
 * section is optional — every search caller treats it as optional and degrades
 * to an empty list.
 */
export async function getJson<T>(
  baseUrl: string,
  path: string,
  query: Record<string, string | number | undefined>,
  user: AccessToken,
): Promise<T> {
  const url = new URL(path, baseUrl);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: identityHeaders(user),
    signal: AbortSignal.timeout(env.UPSTREAM_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`GET ${url.pathname} responded ${response.status}`);
  }

  return (await response.json()) as T;
}
