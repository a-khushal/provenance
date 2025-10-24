"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Search, Loader2, ExternalLink, CheckCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import WalletConnection from "@/components/wallet-connection"

interface VerifyFormInputs {
    searchPrompt: string
}

interface VerificationResult {
    id: string
    creatorAddress: string
    timestamp: string
    promptHash: string
    outputHash: string
    transactionHash: string
}

export default function VerifyPage() {
    const { register, watch, reset } = useForm<VerifyFormInputs>({
        mode: "onChange",
        defaultValues: {
            searchPrompt: "",
        },
    })

    const searchPrompt = watch("searchPrompt")

    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState<VerificationResult | null>(null)
    const [hasSearched, setHasSearched] = useState(false)
    const [copiedHash, setCopiedHash] = useState<string | null>(null)

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedHash(id)
        setTimeout(() => setCopiedHash(null), 2000)
    }

    const handleVerify = async () => {
        if (!searchPrompt.trim()) return

        setIsLoading(true)
        setHasSearched(true)

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500))

            if (Math.random() > 0.3) {
                setResults({
                    id: "result-1",
                    creatorAddress: "9B5X...7kL2",
                    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString(),
                    promptHash: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f",
                    outputHash: "f1e2d3c4b5a6z7y8x9w0v1u2t3s4r5q6p7o8n9m0l1k2j3i4h5g6f7e8d9c0b1a",
                    transactionHash: "5Zx9...kL2m",
                })
            } else {
                setResults(null)
            }
        } catch (error) {
            setResults(null)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-y-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(59,130,246,.05)_25%,rgba(59,130,246,.05)_26%,transparent_27%,transparent_74%,rgba(59,130,246,.05)_75%,rgba(59,130,246,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(59,130,246,.05)_25%,rgba(59,130,246,.05)_26%,transparent_27%,transparent_74%,rgba(59,130,246,.05)_75%,rgba(59,130,246,.05)_76%,transparent_77%,transparent)] bg-size-[50px_50px]" />
            </div>

            <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:px-12 md:py-20">
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
                        <label className="block text-sm font-semibold whitespace-nowrap">Search by Prompt</label>
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
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle className="w-5 h-5 text-blue-400" />
                                        <h2 className="text-xl font-semibold">Content Found</h2>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-400 mb-2">Creator Wallet</p>
                                        <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                                            <span className="font-mono text-sm text-slate-200">{results.creatorAddress}</span>
                                            <button
                                                onClick={() => copyToClipboard(results.creatorAddress, "creator")}
                                                className="p-2 hover:bg-slate-700 rounded transition"
                                            >
                                                {copiedHash === "creator" ? (
                                                    <Check className="w-4 h-4 text-blue-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-slate-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-400 mb-2">Registration Date</p>
                                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                                            <p className="text-sm text-slate-200">{results.timestamp}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-400 mb-2">Prompt Hash</p>
                                        <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                                            <span className="font-mono text-xs text-slate-300 break-all">{results.promptHash}</span>
                                            <button
                                                onClick={() => copyToClipboard(results.promptHash, "prompt")}
                                                className="p-2 hover:bg-slate-700 rounded transition shrink-0 ml-2"
                                            >
                                                {copiedHash === "prompt" ? (
                                                    <Check className="w-4 h-4 text-blue-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-slate-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-400 mb-2">Output Hash</p>
                                        <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                                            <span className="font-mono text-xs text-slate-300 break-all">{results.outputHash}</span>
                                            <button
                                                onClick={() => copyToClipboard(results.outputHash, "output")}
                                                className="p-2 hover:bg-slate-700 rounded transition shrink-0 ml-2"
                                            >
                                                {copiedHash === "output" ? (
                                                    <Check className="w-4 h-4 text-blue-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-slate-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-700">
                                        <a
                                            href={`https://solscan.io/tx/${results.transactionHash}?cluster=devnet`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition"
                                        >
                                            View on Solana Explorer
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-slate-900/30 border border-slate-700 rounded-lg backdrop-blur text-center">
                                    <p className="text-slate-400">No results found for this prompt.</p>
                                    <p className="text-slate-500 text-sm mt-2">
                                        Try searching for a different prompt or register new content.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
