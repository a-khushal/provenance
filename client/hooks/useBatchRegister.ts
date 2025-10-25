import { Provenance } from "@/program/provenance";
import { Program, BN } from "@coral-xyz/anchor";
import { useState } from "react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

export interface BatchRegistrationItem {
    prompt: string;
    aiOutput: string;
    promptHash: Uint8Array;
    outputHash: Uint8Array;
}

type BatchRegisterResult = {
    signatures?: string[];
    error?: string;
};

export const useBatchRegister = (
    program: Program<Provenance> | null,
    items: BatchRegistrationItem[]
) => {
    const wallet = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [transactionSignatures, setTransactionSignatures] = useState<string[]>([]);

    const generateHash = async (text: string): Promise<Uint8Array> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
        return new Uint8Array(hashBuffer);
    };

    const batchRegister = async (): Promise<BatchRegisterResult> => {
        if (!program || !wallet.publicKey) return { error: "Program or wallet not connected" };
        if (!wallet.signTransaction) {
            return { error: "Wallet does not support signing" };
        }
        if (items.length === 0) return { error: "No items to register" };
        if (items.length > 10) return { error: "Too many items (max 10)" };

        setLoading(true);
        setError(null);

        try {
            const transaction = new Transaction();
            const signatures: string[] = [];

            for (const item of items) {
                const promptHash = item.promptHash.length > 0 ? item.promptHash : await generateHash(item.prompt);
                const outputHash = item.outputHash.length > 0 ? item.outputHash : await generateHash(item.aiOutput);

                const [registrationPda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("registration"), wallet.publicKey.toBuffer(), promptHash],
                    program.programId
                );

                const [promptIndexPda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("prompt_index"), promptHash],
                    program.programId
                );

                const instruction = await program.methods
                    .registerContent(Array.from(promptHash), Array.from(outputHash))
                    .accountsStrict({
                        registration: registrationPda,
                        promptIndex: promptIndexPda,
                        creator: wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .instruction();

                transaction.add(instruction);
            }

            const signature = await wallet.sendTransaction(transaction, program.provider.connection, {
                skipPreflight: false,
                preflightCommitment: 'confirmed'
            });

            await program.provider.connection.confirmTransaction(signature, 'confirmed');

            setTransactionSignatures([signature]);
            setIsRegistered(true);
            return { signatures: [signature] };
        } catch (err: any) {
            const msg = err instanceof Error ? err.message : "An unknown error occurred";
            setError(msg);
            return { error: msg };
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, isRegistered, transactionSignatures, batchRegister };
};
