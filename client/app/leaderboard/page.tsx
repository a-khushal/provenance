"use client"

import { useEffect, useState } from "react"
import { Loader2, ExternalLink, Copy, Check, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Registration {
    id: string
    creator: string
    timestamp: number
    promptHash: string
    outputHash: string
    promptPreview: string
    outputPreview: string
}

export default function LeaderboardPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [copiedHash, setCopiedHash] = useState<string | null>(null)

    const itemsPerPage = 10

    useEffect(() => {
        fetchRegistrations()
    }, [page])

    const fetchRegistrations = async () => {
        setLoading(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const mockRegistrations: Registration[] = Array.from({ length: itemsPerPage }, (_, i) => ({
                id: `reg_${page}_${i}`,
                creator: `${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
                timestamp: Date.now() - (page - 1) * itemsPerPage * 3600000 - i * 3600000,
                promptHash: Math.random().toString(16).substring(2, 66),
                outputHash: Math.random().toString(16).substring(2, 66),
                promptPreview: "Create a logo for a tech startup that specializes in blockchain...".substring(0, 50) + "...",
                outputPreview:
                    "A modern, minimalist logo featuring interconnected nodes in a circular pattern...".substring(0, 50) + "...",
            }))

            if (page === 1) {
                setRegistrations(mockRegistrations)
            } else {
                setRegistrations((prev) => [...prev, ...mockRegistrations])
            }

            setHasMore(mockRegistrations.length === itemsPerPage)
        } catch (error) {
            console.error("Failed to fetch registrations:", error)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string, hash: string) => {
        navigator.clipboard.writeText(text)
        setCopiedHash(hash)
        setTimeout(() => setCopiedHash(null), 2000)
    }

    const truncateAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    }

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString() + " " + date.toLocaleTimeString()
    }

    return (
        <div className="min-h-screen bg-linear-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(59,130,246,.05)_25%,rgba(59,130,246,.05)_26%,transparent_27%,transparent_74%,rgba(59,130,246,.05)_75%,rgba(59,130,246,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(59,130,246,.05)_25%,rgba(59,130,246,.05)_26%,transparent_27%,transparent_74%,rgba(59,130,246,.05)_75%,rgba(59,130,246,.05)_76%,transparent_77%,transparent)] bg-size-[50px_50px]" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-20">
                <div className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
                        <span className="text-white">Recent</span>
                        <br />
                        <span className="text-slate-400">Registrations</span>
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-md mt-6">
                        View all content registered on Provenance. Every registration is immutable and verifiable on Solana.
                    </p>
                </div>

                <div className="bg-slate-900/30 border border-slate-700/50 rounded-lg backdrop-blur overflow-hidden">
                    {loading && registrations.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                    ) : registrations.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-slate-400 text-lg">No registrations yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700/50 bg-slate-800/30">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Creator</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Timestamp</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Prompt Preview</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Output Preview</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Prompt Hash</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map((reg) => (
                                        <tr key={reg.id} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition">
                                            <td className="px-6 py-4">
                                                <a
                                                    href={`https://solscan.io/address/${reg.creator}?cluster=devnet`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 font-mono text-sm flex items-center gap-2"
                                                >
                                                    {truncateAddress(reg.creator)}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-300">{formatTimestamp(reg.timestamp)}</td>
                                            <td className="px-6 py-4 text-sm text-slate-400">{reg.promptPreview}</td>
                                            <td className="px-6 py-4 text-sm text-slate-400">{reg.outputPreview}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                                                        {reg.promptHash.substring(0, 16)}...
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(reg.promptHash, reg.promptHash)}
                                                        className="text-slate-400 hover:text-blue-400 transition"
                                                        title="Copy hash"
                                                    >
                                                        {copiedHash === reg.promptHash ? (
                                                            <Check className="w-4 h-4 text-blue-400" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-8">
                    <div className="text-slate-400 text-sm">
                        Page <span className="font-semibold text-white">{page}</span>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!hasMore || loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Next"
                            )}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
