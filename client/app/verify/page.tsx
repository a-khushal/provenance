"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Search, Loader2, CheckCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVerify } from "@/hooks/useVerify"
import { PublicKey } from "@solana/web3.js"

interface VerifyFormInputs {
    searchPrompt: string
}

interface VerificationResult {
    exists: boolean
    registrations?: Array<{
        registrationPk: PublicKey
        promptHash: Uint8Array
        outputHash: Uint8Array
        creator: PublicKey
        timestamp: number
    }>
    error?: string
}

export default function VerifyPage() {
    const { register, watch } = useForm<VerifyFormInputs>({
        mode: "onChange",
        defaultValues: { searchPrompt: "" },
    })

    const searchPrompt = watch("searchPrompt")
    const [results, setResults] = useState<VerificationResult | null>(null)
    const [hasSearched, setHasSearched] = useState(false)
    const [copiedHash, setCopiedHash] = useState<string | null>(null)
    const { verifyPrompt, isLoading, error: verifyError } = useVerify()

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedHash(id)
        setTimeout(() => setCopiedHash(null), 2000)
    }

    const handleVerify = async () => {
        if (!searchPrompt.trim()) return
        setHasSearched(true)

        try {
            const encoder = new TextEncoder()
            const data = encoder.encode(searchPrompt)
            const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer)
            const promptHash = new Uint8Array(hashBuffer)

            const result = await verifyPrompt(promptHash)
            setResults(result)
        } catch (error) {
            console.error("Verification failed:", error)
            setResults({
                exists: false,
                error: "Failed to verify content. Please try again."
            })
        }
    }

    return (
        <div className="relative z-1 min-h-screen bg-linear-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(59,130,246,.05)_25%,rgba(59,130,246,.05)_26%,transparent_27%,transparent_74%,rgba(59,130,246,.05)_75%,rgba(59,130,246,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(59,130,246,.05)_25%,rgba(59,130,246,.05)_26%,transparent_27%,transparent_74%,rgba(59,130,246,.05)_75%,rgba(59,130,246,.05)_76%,transparent_77%,transparent)] bg-size-[50px_50px]" />
            </div>

            <main className="relative z-1 max-w-4xl mx-auto px-6 py-12 md:px-12 md:py-14">
                <div className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
                        <span className="text-white">Verify</span>
                        <br />
                        <span className="text-slate-400">AI-Generated</span>
                        <br />
                        <span className="text-slate-500">Content.</span>
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-md mt-6">
                        Search for registered content on the Solana blockchain. Verify authenticity and view registration details.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <label className="block text-sm font-semibold whitespace-nowrap">
                            Search by Prompt
                        </label>
                        <div className="flex-1 w-full">
                            <div className="flex gap-3 items-center">
                                <input
                                    {...register("searchPrompt")}
                                    placeholder="Enter a prompt to verify..."
                                    className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 backdrop-blur w-full"
                                />
                                <Button
                                    onClick={handleVerify}
                                    disabled={!searchPrompt.trim() || isLoading}
                                    className={`shrink-0 px-4 py-2 flex items-center font-semibold transition ${searchPrompt.trim() && !isLoading
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-1 animate-spin inline" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4 mr-2 inline" />
                                            Verify
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {hasSearched && (
                        <div className="mt-8">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                </div>
                            ) : results ? (
                                <div className="space-y-6 p-6 bg-slate-900/30 border border-slate-700 rounded-lg backdrop-blur">
                                    {results?.exists && results.registrations ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 text-green-400">
                                                <CheckCircle className="w-5 h-5" />
                                                <span className="font-medium">
                                                    Content verified on Solana ({results.registrations.length} registration{results.registrations.length > 1 ? 's' : ''})
                                                </span>
                                            </div>

                                            <div className="space-y-6">
                                                {results.registrations.map((registration, index) => (
                                                    <div key={registration.registrationPk.toBase58()} className="p-4 bg-slate-800/30 border border-slate-600 rounded-lg">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="text-sm font-medium text-slate-300">
                                                                Registration #{index + 1}
                                                            </h4>
                                                            <span className="text-xs text-slate-500">
                                                                {new Date(registration.timestamp * 1000).toLocaleString()}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h5 className="text-xs font-medium text-slate-400">Creator Address</h5>
                                                                    <button
                                                                        onClick={() => copyToClipboard(registration.creator.toBase58(), `creator-${index}`)}
                                                                        className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                                                                    >
                                                                        {copiedHash === `creator-${index}` ? (
                                                                            <><Check className="w-3 h-3" /> Copied</>
                                                                        ) : (
                                                                            <><Copy className="w-3 h-3" /> Copy</>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                <div className="font-mono text-xs bg-slate-700/50 px-3 py-2 rounded overflow-x-auto">
                                                                    {registration.creator.toBase58()}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h5 className="text-xs font-medium text-slate-400">Prompt Hash</h5>
                                                                    <button
                                                                        onClick={() => copyToClipboard(Array.from(registration.promptHash).map(b => b.toString(16).padStart(2, '0')).join(''), `prompt-${index}`)}
                                                                        className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                                                                    >
                                                                        {copiedHash === `prompt-${index}` ? (
                                                                            <><Check className="w-3 h-3" /> Copied</>
                                                                        ) : (
                                                                            <><Copy className="w-3 h-3" /> Copy</>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                <div className="font-mono text-xs bg-slate-700/50 px-3 py-2 rounded overflow-x-auto">
                                                                    {Array.from(registration.promptHash).map(b => b.toString(16).padStart(2, '0')).join('')}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h5 className="text-xs font-medium text-slate-400">Output Hash</h5>
                                                                    <button
                                                                        onClick={() => copyToClipboard(Array.from(registration.outputHash).map(b => b.toString(16).padStart(2, '0')).join(''), `output-${index}`)}
                                                                        className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                                                                    >
                                                                        {copiedHash === `output-${index}` ? (
                                                                            <><Check className="w-3 h-3" /> Copied</>
                                                                        ) : (
                                                                            <><Copy className="w-3 h-3" /> Copy</>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                <div className="font-mono text-xs bg-slate-700/50 px-3 py-2 rounded overflow-x-auto">
                                                                    {Array.from(registration.outputHash).map(b => b.toString(16).padStart(2, '0')).join('')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : hasSearched ? (
                                        <div className="p-6 bg-slate-900/30 border border-slate-700 rounded-lg backdrop-blur text-center">
                                            <p className="text-slate-400">No results found for this prompt.</p>
                                            <p className="text-slate-500 text-sm mt-2">
                                                Try searching for a different prompt or register new content.
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
