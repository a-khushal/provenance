"use client"

import { useCallback, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { useProgram } from "./useProgram";
import type { Provenance } from "@/program/provenance";

interface VerificationResult {
    exists: boolean;
    registrations?: Array<{
        registrationPk: PublicKey;
        creator: PublicKey;
        promptHash: Uint8Array;
        outputHash: Uint8Array;
        timestamp: number;
    }>;
    error?: string;
}

export const useVerify = () => {
    const program = useProgram();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const verifyPrompt = useCallback(
        async (promptHash: Uint8Array): Promise<VerificationResult> => {
            if (!program) {
                return { exists: false, error: "Program not connected" };
            }

            if (promptHash.length !== 32) {
                return { exists: false, error: "Invalid prompt hash length" };
            }

            setIsLoading(true);
            setError(null);

            try {
                const [promptIndexPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("prompt_index"), Buffer.from(promptHash)],
                    program.programId
                );

                let promptIndex;
                try {
                    promptIndex = await (program as Program<Provenance>).account.promptIndex.fetch(promptIndexPDA);
                } catch (e) {
                    if ((e as Error).message.includes("Account does not exist")) {
                        return { exists: false };
                    }
                    throw e;
                }

                if (!promptIndex?.registrations?.length) {
                    return { exists: false };
                }

                const allRegistrations = [];
                for (const regPk of promptIndex.registrations) {
                    try {
                        const reg = await (program as Program<Provenance>).account.registration.fetch(regPk);
                        allRegistrations.push({
                            registrationPk: regPk,
                            creator: reg.creator,
                            promptHash: new Uint8Array(reg.promptHash),
                            outputHash: new Uint8Array(reg.outputHash),
                            timestamp: Number(reg.timestamp),
                        });
                    } catch (err) {
                        console.warn(`Failed to fetch registration ${regPk.toBase58()}:`, err);
                    }
                }

                return {
                    exists: true,
                    registrations: allRegistrations
                };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Verification failed";
                setError(errorMessage);
                return { exists: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [program]
    );

    return { verifyPrompt, isLoading, error };
};
