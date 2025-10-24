'use client'

import { ArrowRight, CheckCircle, Search, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            <span className="text-white">Prove Your AI</span>
            <br />
            <span className="text-slate-400">Generated Content</span>
            <br />
            <span className="text-slate-500">On-Chain.</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-md">
            Provenance is a blockchain-based verification system that proves the authenticity and origin of AI-generated
            content. Register your prompt and output to create an immutable, tamper-proof record on Solana.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => router.push('/register')} className="bg-transparent border border-slate-500 hover:border-blue-400 text-white hover:bg-blue-500/10 px-6 py-2 h-auto">
              Register Content
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button onClick={() => router.push('/verify')} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 h-auto">
              Verify Authenticity
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="relative hidden lg:flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-48 h-48 border border-blue-500/30 rounded-full" />
            <div className="absolute w-64 h-64 border border-blue-500/20 rounded-full" />
            <div className="absolute w-80 h-80 border border-blue-500/10 rounded-full" />

            <div className="absolute top-12 right-12 w-16 h-16 border border-blue-500/40 rounded-lg flex items-center justify-center bg-blue-500/5 backdrop-blur">
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>

            <div className="absolute w-20 h-20 border border-blue-500/50 rounded-lg flex items-center justify-center bg-blue-500/10 backdrop-blur">
              <Search className="w-10 h-10 text-blue-300" />
            </div>

            <div className="absolute bottom-20 right-8 w-16 h-16 border border-blue-500/40 rounded-lg flex items-center justify-center bg-blue-500/5 backdrop-blur">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 md:px-12 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group p-6 border border-slate-700 rounded-lg hover:border-blue-500/50 transition bg-slate-900/30 hover:bg-slate-900/50 backdrop-blur">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 border border-blue-500/40 rounded-lg flex items-center justify-center bg-blue-500/5">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Register Your Prompt</h3>
            <p className="text-slate-400 text-sm">
              Upload your original prompt and AI-generated output to create an immutable on-chain record with timestamp
              and wallet verification.
            </p>
          </div>

          <div className="group p-6 border border-slate-700 rounded-lg hover:border-blue-500/50 transition bg-slate-900/30 hover:bg-slate-900/50 backdrop-blur">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 border border-blue-500/40 rounded-lg flex items-center justify-center bg-blue-500/5">
                <Search className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Verify Authenticity</h3>
            <p className="text-slate-400 text-sm">
              Search any prompt to instantly verify who registered it, when it was created, and prove ownership without
              disputes.
            </p>
          </div>

          <div className="group p-6 border border-slate-700 rounded-lg hover:border-blue-500/50 transition bg-slate-900/30 hover:bg-slate-900/50 backdrop-blur">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 border border-blue-500/40 rounded-lg flex items-center justify-center bg-blue-500/5">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
            <p className="text-slate-400 text-sm">
              Browse all registered content and creators. Discover trending AI-generated works and their verified
              origins on Solana.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
