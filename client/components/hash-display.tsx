"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface HashDisplayProps {
    label: string
    hash: string
}

export default function HashDisplay({ label, hash }: HashDisplayProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(hash)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="mt-3 p-3 bg-slate-900 border border-slate-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
                <button onClick={handleCopy} className="text-slate-400 hover:text-teal-400 transition" title="Copy hash">
                    {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
            <code className="text-xs text-teal-300 break-all font-mono">{hash}</code>
        </div>
    )
}
