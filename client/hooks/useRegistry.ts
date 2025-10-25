"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { Program } from "@coral-xyz/anchor"
import { useProgram } from "./useProgram"
import { useWallet } from "@solana/wallet-adapter-react"
import type { Provenance } from "@/program/provenance"

export interface RegistryEntry {
    promptHash: Uint8Array
    outputHash: Uint8Array
    creator: PublicKey
    timestamp: number
}

export const useRegistry = () => {
    const program = useProgram()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [entries, setEntries] = useState<RegistryEntry[]>([])
    const hasFetched = useRef(false)

    const fetchData = useCallback(async () => {
        if (!program || hasFetched.current) return;
        
        hasFetched.current = true;
        setIsLoading(true);
        setError(null);

        try {
            console.log("Fetching registry data...");
            const registrations = await (program as Program<Provenance>).account.registration.all()

            const registryData: RegistryEntry[] = registrations
                .map((reg) => ({
                    promptHash: new Uint8Array(reg.account.promptHash),
                    outputHash: new Uint8Array(reg.account.outputHash),
                    creator: reg.account.creator,
                    timestamp: reg.account.timestamp.toNumber(),
                }))
                .sort((a, b) => b.timestamp - a.timestamp)

            setEntries(registryData);
            return registryData;
        } catch (err) {
            console.error("Error fetching registry:", err);
            setError("Failed to load registry data. Please try again later.");
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [program]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        entries,
        isLoading,
        error,
        refetch: fetchData
    }
}

export default useRegistry
