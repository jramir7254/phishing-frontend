import { useState, useEffect, useCallback } from "react";

// ========================================================
// TYPES
// ========================================================
export interface QueryOptions<T> {
    key: string;
    queryFn: () => Promise<T>;
    staleTime?: number;
}

interface CacheEntry<T = any> {
    data: T | null;
    error: any | null;
    updatedAt: number;
    promise?: Promise<T> | null;
}

// ========================================================
// GLOBAL CACHE + LOCALSTORAGE PERSISTENCE
// ========================================================
const CACHE_STORAGE_KEY = "liteQueryCache_v1";

let queryCache: Record<string, CacheEntry> = {};

// Load stored cache (without promises)
(function loadCache() {
    try {
        const raw = sessionStorage.getItem(CACHE_STORAGE_KEY);
        if (raw) queryCache = JSON.parse(raw);
    } catch (err) {
        console.warn("Failed to load query cache:", err);
    }
})();

function persistCache() {
    const safeCache: Record<string, Omit<CacheEntry, "promise">> = {};
    for (const key in queryCache) {
        const { data, error, updatedAt } = queryCache[key];
        safeCache[key] = { data, error, updatedAt };
    }
    sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(safeCache));
}

// ========================================================
// INVALIDATION
// ========================================================
export function invalidateQuery(key: string) {
    delete queryCache[key];
    persistCache();
}

// ========================================================
// HOOK
// ========================================================
export function useQueryLite<T>({
    key,
    queryFn,
    staleTime = 0
}: QueryOptions<T>) {
    const cached = queryCache[key] as CacheEntry<T> | undefined;

    const [data, setData] = useState<T | null>(cached?.data ?? null);
    const [error, setError] = useState<any | null>(cached?.error ?? null);
    const [loading, setLoading] = useState<boolean>(!cached);

    const load = useCallback(async (): Promise<T | null> => {
        const now = Date.now();
        const cache = queryCache[key] as CacheEntry<T> | undefined;

        // 1. Fresh cache → use immediately
        if (cache && now - cache.updatedAt < staleTime) {
            setData(cache.data);
            setError(cache.error);
            setLoading(false);
            return cache.data;
        }

        // 2. Existing in-flight request → wait on it
        if (cache?.promise) {
            setLoading(true);
            await cache.promise;
            const fresh = queryCache[key] as CacheEntry<T>;
            setData(fresh.data);
            setError(fresh.error);
            setLoading(false);
            return fresh.data;
        }

        // 3. Create new request
        const promise = (async () => {
            try {
                const result = await queryFn();
                queryCache[key] = {
                    data: result,
                    error: null,
                    updatedAt: Date.now(),
                    promise: null
                };
                persistCache();
                return result;
            } catch (err) {
                queryCache[key] = {
                    data: null,
                    error: err,
                    updatedAt: Date.now(),
                    promise: null
                };
                persistCache();
                throw err;
            }
        })();

        // attach promise to cache for dedupe
        queryCache[key] = {
            ...(queryCache[key] || {}),
            promise
        } as CacheEntry<T>;

        // Execute the promise
        try {
            const result = await promise;
            setData(result);
            setError(null);
            setLoading(false);
            return result;
        } catch (err) {
            setError(err);
            setLoading(false);
            return null;
        }
    }, [key, queryFn, staleTime]);

    useEffect(() => {
        load();
    }, [load]);

    return {
        data,
        error,
        loading,
        refetch: load
    };
}
