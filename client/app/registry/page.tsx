"use client"

import { useState, useEffect } from "react"
import { Loader2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRegistry } from "@/hooks/useRegistry"

const HASH_DISPLAY_LENGTH = 12

export default function RegistryPage() {
    const { connected } = useWallet()
    const { entries, isLoading, error, refetch } = useRegistry()
    const [copiedHash, setCopiedHash] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const pageSize = 10

    const copyToClipboard = (text: string, hash: string) => {
        navigator.clipboard.writeText(text)
        setCopiedHash(hash)
        setTimeout(() => setCopiedHash(null), 2000)
    }

    const truncateHash = (hash: Uint8Array, length: number = HASH_DISPLAY_LENGTH) => {
        const hex = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('')
        return `${hex.substring(0, length)}...${hex.substring(hex.length - length)}`
    }

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp * 1000)
        return date.toLocaleDateString() + " " + date.toLocaleTimeString()
    }

    const totalPages = Math.ceil(entries.length / pageSize)
    const paginatedEntries = entries.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="min-h-screen bg-linear-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(59,130,246,.05)_25%,rgba(59,130,246,.05)_26%,transparent_27%,transparent_74%,rgba(59,130,246,.05)_75%,rgba(59,130,246,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(59,130,246,.05)_25%,rgba(59,130,246,.05)_26%,transparent_27%,transparent_74%,rgba(59,130,246,.05)_75%,rgba(59,130,246,.05)_76%,transparent_77%,transparent)] bg-size-[50px_50px]" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
                            <span className="text-white">Recent</span>
                            <br />
                            <span className="text-slate-400">Registrations</span>
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                            View all content registered on Provenance. Every registration is immutable and verifiable on Solana.
                        </p>
                    </div>
                    <Button
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed self-start md:self-auto cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Refreshing...
                            </>
                        ) : (
                            'Refresh Registry'
                        )}
                    </Button>
                </div>

                <div className="bg-slate-900/30 border border-slate-700/50 rounded-lg backdrop-blur overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-20 text-red-400">
                            {error}
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-slate-400 text-lg">No registrations found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {paginatedEntries.map((entry, index) => (
                                <div
                                    key={`${entry.creator.toBase58()}-${entry.timestamp}`}
                                    className="p-6 hover:bg-slate-800/30 transition-colors"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-400">By</span>
                                                <span className="font-mono text-sm text-slate-300">
                                                    {entry.creator.toBase58().substring(0, 10)}...{entry.creator.toBase58().slice(-4)}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        copyToClipboard(entry.creator.toBase58(), `creator-${(page - 1) * pageSize + index}`)
                                                    }
                                                    className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                                                >
                                                    {copiedHash === `creator-${(page - 1) * pageSize + index}` ? (
                                                        <><Check className="w-3 h-3" /> Copied</>
                                                    ) : (
                                                        <><Copy className="w-3 h-3" /> Copy</>
                                                    )}
                                                </button>
                                                <span className="text-slate-600">•</span>
                                                <span className="text-sm text-slate-500">{formatTimestamp(entry.timestamp)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-slate-800/50 px-2 py-1 rounded">
                                                    #{(page - 1) * pageSize + index + 1}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-slate-300">Prompt Hash</span>
                                                <button
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            Array.from(entry.promptHash)
                                                                .map(b => b.toString(16).padStart(2, '0'))
                                                                .join(''),
                                                            `prompt-${(page - 1) * pageSize + index}`
                                                        )
                                                    }
                                                    className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                                                >
                                                    {copiedHash === `prompt-${(page - 1) * pageSize + index}` ? (
                                                        <><Check className="w-3 h-3" /> Copied</>
                                                    ) : (
                                                        <><Copy className="w-3 h-3" /> Copy</>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="font-mono text-sm bg-slate-800/50 px-4 py-2 rounded-lg overflow-x-auto">
                                                {truncateHash(entry.promptHash)}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-slate-300">Output Hash</span>
                                                <button
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            Array.from(entry.outputHash)
                                                                .map(b => b.toString(16).padStart(2, '0'))
                                                                .join(''),
                                                            `output-${(page - 1) * pageSize + index}`
                                                        )
                                                    }
                                                    className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                                                >
                                                    {copiedHash === `output-${(page - 1) * pageSize + index}` ? (
                                                        <><Check className="w-3 h-3" /> Copied</>
                                                    ) : (
                                                        <><Copy className="w-3 h-3" /> Copy</>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="font-mono text-sm bg-slate-800/50 px-4 py-2 rounded-lg overflow-x-auto">
                                                {truncateHash(entry.outputHash)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {connected && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8">
                        <div className="text-slate-400 text-sm">
                            Page <span className="font-semibold text-white">{page}</span> of {totalPages}
                        </div>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
