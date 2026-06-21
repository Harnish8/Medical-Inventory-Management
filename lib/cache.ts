/**
 * Server-side cache utility using Next.js unstable_cache.
 *
 * On Vercel this caches the result at the infrastructure level
 * (shared across ALL serverless function instances for the same deployment).
 * On local dev it still works but revalidation is per-process.
 *
 * Usage:
 *   const data = await cachedQuery("inventory", fetchInventory, 30);
 */

import { unstable_cache } from "next/cache";
import dbConnect from "./mongodb";

type Fetcher<T> = () => Promise<T>;

/**
 * Wrap a DB fetcher with unstable_cache.
 * @param key    Unique string key for this query (used as the cache tag)
 * @param fn     Async function that performs the DB query (no arguments)
 * @param ttlSec Time-to-live in seconds (default 30)
 */
export function withCache<T>(key: string, fn: Fetcher<T>, ttlSec = 30): Fetcher<T> {
  return unstable_cache(
    async () => {
      await dbConnect();
      return fn();
    },
    [key],
    {
      revalidate: ttlSec,
      tags: [key],
    }
  );
}
