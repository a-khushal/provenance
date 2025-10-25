"use client"

import { Program, AnchorProvider, setProvider, type Idl } from "@coral-xyz/anchor";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import idl from "@/program/provenance.json";
import type { Provenance } from "@/program/provenance";

export const useProgram = () => {
    const { wallet, signTransaction, signAllTransactions, publicKey } = useWallet();

    const connection = new Connection(clusterApiUrl("devnet"), {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000,
        fetch: (url, options) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    fetch(url, options)
                        .then(resolve)
                        .catch(reject);
                }, 100);
            });
        }
    });

    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) return null;

    const signer = {
        publicKey,
        signTransaction,
        signAllTransactions,
    };
    const provider = new AnchorProvider(connection, signer, {
        commitment: "confirmed",
        skipPreflight: false,
        preflightCommitment: "confirmed"
    });
    setProvider(provider);

    const program = new Program(idl as Idl, provider) as Program<Provenance>;
    return program
};
