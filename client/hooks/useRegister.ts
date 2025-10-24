'use client'

import { Provenance } from "@/program/provenance";
import { Program } from "@coral-xyz/anchor";
import { useState, useEffect } from "react";

export const useRegister = (program: Program<Provenance> | null, promptHash: Uint8Array, aiOutputHash: Uint8Array, address: string | null) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

    const register = async (): Promise<{ signature: string } | { error: string }> => {
        if (!program || !address) {
            return { error: "Program or address not available" };
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const signature = await program.methods
                .registerContent(Array.from(promptHash), Array.from(aiOutputHash))
                .accounts({
                    creator: address
                })
                .rpc();
                
            setIsRegistered(true);
            setTransactionSignature(signature);
            return { signature };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
            setError(errorMessage);
            return { error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { 
        loading, 
        error, 
        isRegistered, 
        transactionSignature,
        register 
    };
};
