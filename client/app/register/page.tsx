"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Check, Loader2, ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import HashDisplay from "@/components/hash-display"
import { useWallet } from "@solana/wallet-adapter-react"
import { useProgram } from "@/hooks/useProgram"
import { useRegister } from "@/hooks/useRegister"

type TransactionStatus = "idle" | "pending" | "success" | "error"

interface RegisterFormInputs {
    prompt: string
    aiOutput: string
}

export default function RegisterPage() {
    const {
        register,
        watch,
        reset,
        formState: { isValid },
    } = useForm<RegisterFormInputs>({
        mode: "onChange",
        defaultValues: {
            prompt: "",
            aiOutput: "",
        },
    })

    const prompt = watch("prompt")
    const aiOutput = watch("aiOutput")

    const [promptHash, setPromptHash] = useState<Uint8Array | null>(null)
    const [outputHash, setOutputHash] = useState<Uint8Array | null>(null)
    const [promptHashHex, setPromptHashHex] = useState("")
    const [outputHashHex, setOutputHashHex] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("idle")
    const [transactionHash, setTransactionHash] = useState<string>("")
    const { connected, publicKey } = useWallet()
    const program = useProgram();
    const address = publicKey?.toBase58();
    const { loading, error, isRegistered, transactionSignature, register: registerFunction } = useRegister(
        program,
        promptHash || new Uint8Array(),
        outputHash || new Uint8Array(),
    );

    useEffect(() => {
        if (transactionSignature) {
            setTransactionStatus("success");
            setTransactionHash(transactionSignature);
        }
    }, [transactionSignature]);

    useEffect(() => {
        if (prompt) {
            generateHash(prompt).then(hash => {
                setPromptHash(hash)
                setPromptHashHex(Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join(''))
            })
        } else {
            setPromptHash(null)
            setPromptHashHex("")
        }
    }, [prompt])

    useEffect(() => {
        if (aiOutput) {
            generateHash(aiOutput).then(hash => {
                setOutputHash(hash)
                setOutputHashHex(Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join(''))
            })
        } else {
            setOutputHash(null)
            setOutputHashHex("")
        }
    }, [aiOutput])

    const generateHash = async (text: string): Promise<Uint8Array> => {
        const encoder = new TextEncoder()
        const data = encoder.encode(text)
        const hashBuffer = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer)
        return new Uint8Array(hashBuffer)
    }

    const handleRegister = async () => {
        if (!connected || !isValid) {
            setErrorMessage("Please connect your wallet and fill in all fields");
            return;
        }

        setTransactionStatus("pending");
        setErrorMessage("");

        try {
            if (!promptHash || !outputHash || !address) {
                throw new Error("Missing required data for registration");
            }

            const result = await registerFunction();
            
            if ('error' in result) {
                // Check if it's a duplicate registration
                if (result.error?.includes('already been processed') || 
                    result.error?.includes('already been registered')) {
                    setTransactionStatus("success");
                    setSuccessMessage("This content has already been registered!");
                    return;
                }
                throw new Error(result.error || 'Registration failed');
            }

            // Success case
            setTransactionStatus("success");
            setSuccessMessage("Successfully registered content!");
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to register content";
            setErrorMessage(errorMessage);
            setTransactionStatus("error");
            console.error("Registration error:", error);
        }
    }

    const isFormValid = connected && isValid && prompt.trim() && aiOutput.trim() && promptHash !== null && outputHash !== null && address !== null

    return (
        <div className="min-h-screen">

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:px-12 md:py-20">
                <div className="flex flex-col md:flex-row gap-12">
                    <div className="md:w-1/2">
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
                            <span className="text-white">Register Your</span>
                            <br />
                            <span className="text-slate-400">AI-Generated</span>
                            <br />
                            <span className="text-slate-500">Content.</span>
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed mt-6">
                            Prove ownership and authenticity with an immutable
                            on-chain record. Register your prompt and output on
                            Solana.
                        </p>
                    </div>

                    <div className="md:w-1/2">
                        {connected && (
                            <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur">
                                <p className="text-sm text-blue-300">
                                    Connected: <span className="font-mono text-blue-200">{publicKey?.toBase58()}</span>
                                </p>
                            </div>
                        )}

                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-semibold mb-3">Your Prompt</label>
                                <textarea
                                    {...register("prompt")}
                                    placeholder="Enter the prompt you used to generate the content..."
                                    className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none backdrop-blur"
                                />
                                {promptHashHex && <HashDisplay label="Prompt Hash" hash={promptHashHex} />}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-3">AI-Generated Output</label>
                                <textarea
                                    {...register("aiOutput")}
                                    placeholder="Paste the AI-generated content here..."
                                    className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none backdrop-blur"
                                />
                                {outputHashHex && <HashDisplay label="Output Hash" hash={outputHashHex} />}
                            </div>

                            {transactionStatus !== "idle" && (
                                <div
                                    className={`p-4 rounded-lg border backdrop-blur ${transactionStatus === "pending"
                                        ? "bg-blue-500/10 border-blue-500/30"
                                        : transactionStatus === "success"
                                            ? "bg-blue-500/10 border-blue-500/30"
                                            : "bg-red-500/10 border-red-500/30"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {transactionStatus === "pending" && (
                                            <>
                                                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                                <p className="text-blue-300">Registering content on Solana...</p>
                                            </>
                                        )}
                                        {transactionStatus === "success" && (
                                            <>
                                                <Check className="w-5 h-5 text-blue-400" />
                                                <div>
                                                    <p className="text-blue-300 font-semibold">Content registered successfully!</p>
                                                    <a
                                                        href={`https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mt-1"
                                                    >
                                                        View on Solana Explorer
                                                        <ExternalLink className="w-3 h-3" />
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

                            <Button
                                onClick={handleRegister}
                                disabled={!isFormValid || transactionStatus === "pending"}
                                className={`w-full py-3 font-semibold text-lg transition ${isFormValid
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                                    }`}
                            >
                                Register Content
                                <ArrowRight className="w-4 h-4 ml-2 inline" />
                            </Button>

                            {!connected && (
                                <p className="text-center text-slate-400 text-sm">Connect your wallet to register content</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
