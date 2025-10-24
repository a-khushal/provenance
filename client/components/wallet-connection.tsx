"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut } from "lucide-react"

interface WalletConnectionProps {
  onConnect: (address: string) => void
  onDisconnect: () => void
}

export default function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState("")

  const handleConnect = async () => {
    // Simulate Anza wallet connection
    // In production, this would use @anza-finance/wallet-adapter or similar
    const mockAddress = "7qLj" + Math.random().toString(36).substring(2, 15).toUpperCase() + "...xyz"
    setAddress(mockAddress)
    setIsConnected(true)
    onConnect(mockAddress)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setAddress("")
    onDisconnect()
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-400">
          <span className="font-mono text-teal-400">{address}</span>
        </div>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
          className="border-slate-600 hover:border-red-500 text-slate-300 hover:text-red-400 bg-transparent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleConnect} className="bg-teal-600 hover:bg-teal-700 text-white">
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  )
}
