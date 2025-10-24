"use client"

import { useCallback, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { useProgram } from "./useProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Provenance } from "@/program/provenance";

interface VerificationResult {
    exists: boolean;
    registration?: {
        promptHash: Uint8Array;
        outputHash: Uint8Array;
        creator: PublicKey;
        timestamp: number;
    };
    error?: string;
}

export const useVerify = () => {
    const program = useProgram();
    const { publicKey } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const verifyPrompt = useCallback(
        async (promptHash: Uint8Array): Promise<VerificationResult> => {
            if (!program || !publicKey) {
                return {
                    exists: false,
                    error: "Program or wallet not connected"
                };
            }

            if (promptHash.length !== 32) {
                return {
                    exists: false,
                    error: "Invalid prompt hash length. Expected 32 bytes."
                };
            }

            setIsLoading(true);
            setError(null);

            try {
                const [registrationPDA] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("registration"),
                        publicKey.toBuffer(),
                        promptHash,
                    ],
                    program.programId
                );

                const registration = await (program as Program<Provenance>).account.registration.fetch(registrationPDA);

                const promptHashBytes = new Uint8Array(registration.promptHash);
                const outputHashBytes = new Uint8Array(registration.outputHash);

                return {
                    exists: true,
                    registration: {
                        promptHash: promptHashBytes,
                        outputHash: outputHashBytes,
                        creator: registration.creator,
                        timestamp: registration.timestamp.toNumber(),
                    },
                };
            } catch (err) {
                if ((err as Error).message.includes("Account does not exist")) {
                    return { exists: false };
                }

                console.error("Verification error:", err);
                return {
                    exists: false,
                    error: (err as Error).message || "Failed to verify content"
                };
            } finally {
                setIsLoading(false);
            }
        },
        [program, publicKey]
    );

    return {
        verifyPrompt,
        isLoading,
        error,
    };
};
