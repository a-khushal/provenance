"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
    () =>
        import('@solana/wallet-adapter-react-ui').then(
            (mod) => mod.WalletMultiButton
        ),
    { ssr: false }
);

export default function AppBar() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 md:py-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold">Provenance</span>
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-8">
                <Link href="/register" className="text-sm hover:text-blue-400 transition">
                    Register
                </Link>
                <Link href="/verify" className="text-sm hover:text-blue-400 transition">
                    Verify
                </Link>
                <Link href="/leaderboard" className="text-sm hover:text-blue-400 transition">
                    Leaderboard
                </Link>
                {mounted && <WalletMultiButton />}
            </div>
        </nav>
    );
}
