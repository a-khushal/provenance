"use client"

import { useState } from "react"
import { Loader2, Copy, Check, Users, Filter, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRegistry } from "@/hooks/useRegistry"
import CreatorProfile from "@/components/creator-profile"
import CertificateExport from "@/components/certificate-export"

const HASH_DISPLAY_LENGTH = 12

export default function RegistryPage() {
    const { connected } = useWallet()
    const {
        entries,
        filteredEntries,
        isLoading,
        error,
        refetch,
        selectedCreator,
        setSelectedCreator,
        creatorStats,
        clearCreatorFilter
    } = useRegistry()
    const [copiedHash, setCopiedHash] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [showCreatorProfile, setShowCreatorProfile] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState<any>(null)
    const [showCertificateExport, setShowCertificateExport] = useState(false)
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

    const totalPages = Math.ceil(filteredEntries.length / pageSize)
    const paginatedEntries = filteredEntries.slice((page - 1) * pageSize, page * pageSize)

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
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setShowCreatorProfile(!showCreatorProfile)}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white self-start md:self-auto cursor-pointer"
                        >
                            <Users className="mr-2 h-4 w-4" />
                            {showCreatorProfile ? 'Hide' : 'Show'} Creator Profiles
                        </Button>
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
                </div>

                {showCreatorProfile && (
                    <div className="mb-8">
                        <CreatorProfile
                            creatorStats={creatorStats}
                            selectedCreator={selectedCreator}
                            onSelectCreator={setSelectedCreator}
                            onClearFilter={clearCreatorFilter}
                        />
                    </div>
                )}

                {selectedCreator && (
                    <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-blue-400" />
                                <span className="text-blue-300">
                                    Filtered by creator: {selectedCreator.toBase58().substring(0, 8)}...{selectedCreator.toBase58().slice(-8)}
                                </span>
                                <span className="text-slate-400">
                                    ({filteredEntries.length} of {entries.length} registrations)
                                </span>
                            </div>
                            <Button
                                onClick={clearCreatorFilter}
                                size="sm"
                                variant="outline"
                                className="border-blue-500/50 text-black hover:bg-blue-800/30 hover:text-white hover:border-blue-400"
                            >
                                Clear Filter
                            </Button>
                        </div>
                    </div>
                )}

                <div className="bg-slate-900/30 border border-slate-700/50 rounded-lg backdrop-blur overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="text-red-400 mb-4">
                                {error}
                            </div>
                            <Button
                                onClick={() => refetch(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : filteredEntries.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-slate-400 text-lg">
                                {selectedCreator ? 'No registrations found for this creator' : 'No registrations found'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {paginatedEntries.map((entry, index) => (
                                <div
                                    key={`${entry.creator.toBase58()}-${entry.timestamp}-${index}`}
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
                                                <Button
                                                    onClick={() => {
                                                        setSelectedEntry(entry)
                                                        setShowCertificateExport(true)
                                                    }}
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-slate-500 text-black hover:bg-slate-700 hover:text-white text-xs"
                                                >
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    Export
                                                </Button>
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
                            {selectedCreator && (
                                <span className="ml-2 text-blue-400">
                                    (Filtered: {filteredEntries.length} registrations)
                                </span>
                            )}
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

            {showCertificateExport && selectedEntry && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <CertificateExport
                                entry={selectedEntry}
                                onClose={() => {
                                    setShowCertificateExport(false)
                                    setSelectedEntry(null)
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
