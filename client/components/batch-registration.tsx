"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { Check, Loader2, ExternalLink, ArrowRight, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import HashDisplay from "@/components/hash-display"
import { useWallet } from "@solana/wallet-adapter-react"
import { useProgram } from "@/hooks/useProgram"
import { useBatchRegister } from "@/hooks/useBatchRegister"

type TransactionStatus = "idle" | "pending" | "success" | "error"

interface BatchRegistrationFormInputs {
    items: Array<{
        prompt: string
        aiOutput: string
    }>
}

export default function BatchRegistration() {
    const { register, control, watch, formState: { isValid } } = useForm<BatchRegistrationFormInputs>({
        mode: "onChange",
        defaultValues: { items: [{ prompt: "", aiOutput: "" }] },
    })

    const { fields, append, remove } = useFieldArray({ control, name: "items" })
    const watchedItems = watch("items")
    const { connected, publicKey } = useWallet()
    const program = useProgram()
    const address = publicKey?.toBase58()
    const [itemHashes, setItemHashes] = useState<
        { promptHash: Uint8Array; outputHash: Uint8Array; promptHashHex: string; outputHashHex: string }[]
    >([])
    const [successMessage, setSuccessMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("idle")
    const [transactionHash, setTransactionHash] = useState<string>("")

    const generateHash = async (text: string): Promise<Uint8Array> => {
        const encoder = new TextEncoder()
        const data = encoder.encode(text)
        const hashBuffer = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer)
        return new Uint8Array(hashBuffer as ArrayBuffer)
    }

    useEffect(() => {
        const generateAllHashes = async () => {
            const hashes: typeof itemHashes = []
            for (let i = 0; i < watchedItems.length; i++) {
                const prompt = watchedItems[i].prompt.trim()
                const aiOutput = watchedItems[i].aiOutput.trim()

                let promptHash = new Uint8Array()
                let outputHash = new Uint8Array()
                let promptHashHex = ""
                let outputHashHex = ""

                if (prompt) {
                    try {
                        promptHash = new Uint8Array(await generateHash(prompt))
                        promptHashHex = Array.from(promptHash).map(b => b.toString(16).padStart(2, "0")).join("")
                    } catch (error) {
                        console.error('Error generating prompt hash:', error)
                    }
                }

                if (aiOutput) {
                    try {
                        outputHash = new Uint8Array(await generateHash(aiOutput))
                        outputHashHex = Array.from(outputHash).map(b => b.toString(16).padStart(2, "0")).join("")
                    } catch (error) {
                        console.error('Error generating output hash:', error)
                    }
                }

                hashes[i] = {
                    promptHash,
                    outputHash,
                    promptHashHex,
                    outputHashHex,
                }
            }
            console.log('Generated hashes:', hashes)
            setItemHashes(hashes)
        }
        const timeoutId = setTimeout(generateAllHashes, 100)
        return () => clearTimeout(timeoutId)
    }, [watchedItems])

    const addItem = () => append({ prompt: "", aiOutput: "" })
    const removeItem = (index: number) => fields.length > 1 && remove(index)

    const batchRegister = useBatchRegister(
        program,
        watchedItems.map((item, index) => ({
            prompt: item.prompt,
            aiOutput: item.aiOutput,
            promptHash: itemHashes[index]?.promptHash || new Uint8Array(),
            outputHash: itemHashes[index]?.outputHash || new Uint8Array(),
        }))
    )

    useEffect(() => {
        if (batchRegister.transactionSignatures.length > 0) {
            setTransactionStatus("success")
            setTransactionHash(batchRegister.transactionSignatures[0])
        }
    }, [batchRegister.transactionSignatures])

    const handleBatchRegister = async () => {
        if (!connected || !isValid) {
            setErrorMessage("Please connect your wallet and fill in all fields")
            return
        }

        if (watchedItems.length < 2) {
            setErrorMessage("Batch registration requires at least 2 items")
            return
        }
        setTransactionStatus("pending")
        setErrorMessage("")
        try {
            if (!address) throw new Error("Missing wallet address")
            const result = await batchRegister.batchRegister()
            if ("error" in result) throw new Error(result.error || "Batch registration failed")
            setTransactionStatus("success")
            setSuccessMessage(`Successfully registered ${watchedItems.length} items!`)
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to register content"
            setErrorMessage(msg)
            setTransactionStatus("error")
        }
    }

    const isFormValid = connected &&
        isValid &&
        watchedItems.length >= 2 &&
        watchedItems.every(item => item.prompt.trim() && item.aiOutput.trim()) &&
        address !== null

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Batch Registration</h2>
                    <p className="text-sm text-slate-400 mt-1">Minimum 2 items required</p>
                </div>
                <Button onClick={addItem} variant="outline" className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30">
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
            </div>

            {connected && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur">
                    <p className="text-sm text-blue-300">Connected: <span className="font-mono text-blue-200">{publicKey?.toBase58()}</span></p>
                </div>
            )}

            <div className="space-y-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-6 bg-slate-900/30 border border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Item {index + 1}</h3>
                            {fields.length > 1 && (
                                <Button onClick={() => removeItem(index)} variant="outline" size="sm" className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-3">Prompt</label>
                                <textarea
                                    {...register(`items.${index}.prompt`)}
                                    placeholder="Enter the prompt..."
                                    className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none backdrop-blur"
                                />
                                {/* {itemHashes[index]?.promptHashHex && (
                                    <HashDisplay label="Prompt Hash" hash={itemHashes[index].promptHashHex} />
                                )} */}
                                {/* {!itemHashes[index]?.promptHashHex && watchedItems[index].prompt.trim() && (
                                    <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                        <span className="text-xs text-yellow-400">Generating hash...</span>
                                    </div>
                                )} */}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-3">AI Output</label>
                                <textarea
                                    {...register(`items.${index}.aiOutput`)}
                                    placeholder="Paste the AI-generated content..."
                                    className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none backdrop-blur"
                                />
                                {/* {itemHashes[index]?.outputHashHex && (
                                    <HashDisplay label="Output Hash" hash={itemHashes[index].outputHashHex} />
                                )} */}
                                {/* {!itemHashes[index]?.outputHashHex && watchedItems[index].aiOutput.trim() && (
                                    <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                        <span className="text-xs text-yellow-400">Generating hash...</span>
                                    </div>
                                )} */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {transactionStatus !== "idle" && (
                <div className={`p-4 rounded-lg border backdrop-blur ${transactionStatus === "pending" ? "bg-blue-500/10 border-blue-500/30" : transactionStatus === "success" ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                    <div className="flex items-center gap-3">
                        {transactionStatus === "pending" && (
                            <>
                                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                <p className="text-blue-300">Registering {watchedItems.length} items on Solana...</p>
                            </>
                        )}
                        {transactionStatus === "success" && (
                            <>
                                <Check className="w-5 h-5 text-green-400" />
                                <div>
                                    <p className="text-green-300 font-semibold">{successMessage}</p>
                                    <a href={`https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1 mt-1">
                                        View on Solana Explorer <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </>
                        )}
                        {transactionStatus === "error" && (
                            <>
                                <div className="w-5 h-5 text-red-400">✕</div>
                                <p className="text-red-300">{errorMessage}</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            <Button onClick={handleBatchRegister} disabled={!isFormValid || transactionStatus === "pending"} className={`w-full py-3 font-semibold text-lg transition ${isFormValid ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}>
                Register {watchedItems.length} Items
                <ArrowRight className="w-4 h-4 ml-2 inline" />
            </Button>

            {!connected && <p className="text-center text-slate-400 text-sm">Connect your wallet to register content</p>}

            {connected && watchedItems.length < 2 && (
                <p className="text-center text-yellow-400 text-sm">
                    Add at least 2 items to enable batch registration
                </p>
            )}
        </div>
    )
}
