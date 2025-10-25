import { Provenance } from "@/program/provenance";
import { Program } from "@coral-xyz/anchor";
import { useState } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

export const useRegister = (
    program: Program<Provenance> | null,
    promptHash: Uint8Array,
    aiOutputHash: Uint8Array
) => {
    const wallet = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

    const register = async (): Promise<{ signature?: string; error?: string }> => {
        if (!program || !wallet.publicKey) return { error: "Program or wallet not connected" };

        if (!wallet.signTransaction) {
            return { error: "Wallet does not support signing" };
        }

        setLoading(true);
        setError(null);

        try {
            const [registrationPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("registration"), wallet.publicKey.toBuffer(), promptHash],
                program.programId
            );

            const [promptIndexPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("prompt_index"), promptHash],
                program.programId
            );

            const signature = await program.methods
                .registerContent(Array.from(promptHash), Array.from(aiOutputHash))
                .accountsStrict({
                    creator: wallet.publicKey,
                    registration: registrationPda,
                    promptIndex: promptIndexPda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc({
                    skipPreflight: false,
                    commitment: "confirmed"
                });

            setIsRegistered(true);
            setTransactionSignature(signature);
            return { signature };
        } catch (err: any) {
            const msg = err instanceof Error ? err.message : "An unknown error occurred";
            setError(msg);
            return { error: msg };
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, isRegistered, transactionSignature, register };
};