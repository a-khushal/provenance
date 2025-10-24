import { useCallback, useState } from "react"
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
    const { publicKey } = useWallet()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [entries, setEntries] = useState<RegistryEntry[]>([])
    const [hasFetched, setHasFetched] = useState(false)

    const fetchRegistry = useCallback(async () => {
        if (!program) {
            setError("Program not initialized")
            return []
        }

        if (hasFetched) return entries
        setHasFetched(true)

        setIsLoading(true)
        setError(null)

        try {
            const registrations = await (program as Program<Provenance>).account.registration.all()

            const registryData = registrations
                .map((reg) => ({
                    promptHash: new Uint8Array(reg.account.promptHash),
                    outputHash: new Uint8Array(reg.account.outputHash),
                    creator: reg.account.creator,
                    timestamp: reg.account.timestamp.toNumber(),
                }))
                .sort((a, b) => b.timestamp - a.timestamp)

            setEntries(registryData)
            return registryData
        } catch (err) {
            console.error("Error fetching registry:", err)
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch registry data"
            setError(errorMessage)
            return []
        } finally {
            setIsLoading(false)
        }
    }, [program, hasFetched, entries])

    return {
        entries,
        isLoading,
        error,
        fetchRegistry,
    }
}

export default useRegistry
