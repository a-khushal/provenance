"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { Program } from "@coral-xyz/anchor"
import { useProgram } from "./useProgram"
import type { Provenance } from "@/program/provenance"

export interface RegistryEntry {
    promptHash: Uint8Array
    outputHash: Uint8Array
    creator: PublicKey
    timestamp: number
}

export interface CreatorStats {
    creator: PublicKey
    totalRegistrations: number
    firstRegistration: number
    latestRegistration: number
    registrations: RegistryEntry[]
}

const MAX_RETRIES = 3
const BASE_DELAY = 1000
const MAX_DELAY = 30000
const REQUEST_COOLDOWN = 2000

export const useRegistry = () => {
    const program = useProgram()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [entries, setEntries] = useState<RegistryEntry[]>([])
    const [selectedCreator, setSelectedCreator] = useState<PublicKey | null>(null)
    const lastRequestTime = useRef<number>(0)
    const retryCount = useRef<number>(0)
    const isRequesting = useRef<boolean>(false)

    const getRetryDelay = (attempt: number): number => {
        const delay = Math.min(BASE_DELAY * Math.pow(2, attempt), MAX_DELAY)
        return delay + Math.random() * 1000
    }

    const shouldThrottle = (): boolean => {
        const now = Date.now()
        const timeSinceLastRequest = now - lastRequestTime.current
        return timeSinceLastRequest < REQUEST_COOLDOWN
    }

    const sleep = (ms: number): Promise<void> => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    const getCreatorStats = useCallback((entries: RegistryEntry[]): CreatorStats[] => {
        const creatorMap = new Map<string, RegistryEntry[]>()

        entries.forEach(entry => {
            const creatorKey = entry.creator.toBase58()
            if (!creatorMap.has(creatorKey)) {
                creatorMap.set(creatorKey, [])
            }
            creatorMap.get(creatorKey)!.push(entry)
        })

        const stats: CreatorStats[] = []
        creatorMap.forEach((registrations, creatorKey) => {
            const creator = new PublicKey(creatorKey)
            const timestamps = registrations.map(r => r.timestamp)

            stats.push({
                creator,
                totalRegistrations: registrations.length,
                firstRegistration: Math.min(...timestamps),
                latestRegistration: Math.max(...timestamps),
                registrations: registrations.sort((a, b) => b.timestamp - a.timestamp)
            })
        })

        return stats.sort((a, b) => b.totalRegistrations - a.totalRegistrations)
    }, [])

    const getFilteredEntries = useCallback((): RegistryEntry[] => {
        if (!selectedCreator) {
            return entries
        }
        return entries.filter(entry => entry.creator.equals(selectedCreator))
    }, [entries, selectedCreator])

    const getCreators = useCallback((): PublicKey[] => {
        const creatorSet = new Set<string>()
        entries.forEach(entry => {
            creatorSet.add(entry.creator.toBase58())
        })
        return Array.from(creatorSet).map(key => new PublicKey(key))
    }, [entries])

    const fetchData = useCallback(async (force = false) => {
        if (!program) return;

        if (isRequesting.current) {
            console.log("Request already in progress, skipping...")
            return;
        }

        if (!force && shouldThrottle()) {
            console.log("Request throttled, waiting...")
            return;
        }

        isRequesting.current = true;
        lastRequestTime.current = Date.now();

        if (!force) {
            setIsLoading(true);
        }

        setError(null);

        const attemptFetch = async (attempt: number = 0): Promise<RegistryEntry[]> => {
            try {
                console.log(`Fetching registry data... (attempt ${attempt + 1})`);
                const registrations = await (program as Program<Provenance>).account.registration.all()

                const registryData: RegistryEntry[] = registrations
                    .map((reg) => ({
                        promptHash: new Uint8Array(reg.account.promptHash),
                        outputHash: new Uint8Array(reg.account.outputHash),
                        creator: reg.account.creator,
                        timestamp: reg.account.timestamp.toNumber(),
                    }))
                    .sort((a, b) => b.timestamp - a.timestamp)

                retryCount.current = 0;
                setEntries(registryData);
                return registryData;
            } catch (err: any) {
                console.error(`Error fetching registry (attempt ${attempt + 1}):`, err);

                const isRateLimit = err.message?.includes('429') || err.message?.includes('Too many requests');

                if (isRateLimit && attempt < MAX_RETRIES) {
                    const delay = getRetryDelay(attempt);
                    console.log(`Rate limited. Retrying after ${delay}ms...`);
                    await sleep(delay);
                    return attemptFetch(attempt + 1);
                } else if (attempt < MAX_RETRIES) {
                    const delay = getRetryDelay(attempt);
                    console.log(`Request failed. Retrying after ${delay}ms...`);
                    await sleep(delay);
                    return attemptFetch(attempt + 1);
                } else {
                    const errorMessage = isRateLimit
                        ? "Rate limit exceeded. Please wait a moment and try again."
                        : "Failed to load registry data. Please try again later.";
                    setError(errorMessage);
                    retryCount.current = attempt;
                    throw err;
                }
            }
        };

        try {
            const result = await attemptFetch();
            return result;
        } catch (err) {
            console.error("Final error after all retries:", err);
            return [];
        } finally {
            isRequesting.current = false;
            if (!force) {
                setIsLoading(false);
            }
        }
    }, [program]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        entries,
        filteredEntries: getFilteredEntries(),
        isLoading,
        error,
        refetch: fetchData,
        selectedCreator,
        setSelectedCreator,
        creatorStats: getCreatorStats(entries),
        creators: getCreators(),
        clearCreatorFilter: () => setSelectedCreator(null)
    }
}

export default useRegistry
