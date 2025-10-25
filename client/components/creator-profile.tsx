"use client"

import { useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { Button } from "@/components/ui/button"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Calendar, Hash, User, TrendingUp, Filter, X } from "lucide-react"
import type { CreatorStats } from "@/hooks/useRegistry"

interface CreatorProfileProps {
    creatorStats: CreatorStats[]
    selectedCreator: PublicKey | null
    onSelectCreator: (creator: PublicKey | null) => void
    onClearFilter: () => void
}

export const CreatorProfile = ({ 
    creatorStats, 
    selectedCreator, 
    onSelectCreator, 
    onClearFilter 
}: CreatorProfileProps) => {
    const [showAllCreators, setShowAllCreators] = useState(false)
    const displayedStats = showAllCreators ? creatorStats : creatorStats.slice(0, 5)

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000)
        return date.toLocaleDateString()
    }

    const formatAddress = (address: PublicKey) => {
        const str = address.toBase58()
        return `${str.substring(0, 8)}...${str.slice(-8)}`
    }

    const getCreatorRank = (index: number) => {
        if (index === 0) return "🥇"
        if (index === 1) return "🥈"
        if (index === 2) return "🥉"
        return `#${index + 1}`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Creator Profiles</h2>
                    <p className="text-slate-400">
                        Decentralized identity stats for each content creator
                    </p>
                </div>
                {selectedCreator && (
                    <Button
                        onClick={onClearFilter}
                        variant="outline"
                        className="border-slate-500 text-black hover:bg-slate-700 hover:text-white hover:border-slate-400"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Clear Filter
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedStats.map((stats, index) => (
                    <Card 
                        key={stats.creator.toBase58()}
                        className={`bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer ${
                            selectedCreator?.equals(stats.creator) 
                                ? 'border-blue-500/50 bg-blue-900/20' 
                                : ''
                        }`}
                        onClick={() => onSelectCreator(
                            selectedCreator?.equals(stats.creator) ? null : stats.creator
                        )}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-white">
                                    {getCreatorRank(index)}
                                </CardTitle>
                            <Badge 
                                variant="secondary" 
                                className="bg-slate-700 text-slate-200 border-slate-600"
                            >
                                {stats.totalRegistrations} registrations
                            </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="font-mono text-sm text-slate-300">
                                    {formatAddress(stats.creator)}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <div className="text-sm">
                                        <div className="text-slate-300">
                                            First: {formatDate(stats.firstRegistration)}
                                        </div>
                                        <div className="text-slate-400">
                                            Latest: {formatDate(stats.latestRegistration)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-400">
                                    {stats.totalRegistrations > 10 ? 'Very Active' :
                                     stats.totalRegistrations > 5 ? 'Active' :
                                     stats.totalRegistrations > 1 ? 'Occasional' : 'New Creator'}
                                </span>
                            </div>

                            <Button
                                size="sm"
                                variant={selectedCreator?.equals(stats.creator) ? "default" : "outline"}
                                className={`w-full ${
                                    selectedCreator?.equals(stats.creator)
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'border-slate-500 text-black hover:bg-slate-700 hover:text-white hover:border-slate-400'
                                }`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onSelectCreator(
                                        selectedCreator?.equals(stats.creator) ? null : stats.creator
                                    )
                                }}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                {selectedCreator?.equals(stats.creator) ? 'Filtered' : 'Filter by Creator'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {creatorStats.length > 5 && (
                <div className="flex justify-center">
                    <Button
                        onClick={() => setShowAllCreators(!showAllCreators)}
                        variant="outline"
                        className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-400"
                    >
                        {showAllCreators ? 'Show Less' : `Show All ${creatorStats.length} Creators`}
                    </Button>
                </div>
            )}

            {selectedCreator && (
                <Card className="bg-blue-900/20 border-blue-500/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Hash className="w-5 h-5" />
                            Filtered by Creator
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="font-mono text-sm text-blue-300">
                                {formatAddress(selectedCreator)}
                            </div>
                            <Badge className="bg-blue-600 text-white border-blue-500">
                                {creatorStats.find(s => s.creator.equals(selectedCreator))?.totalRegistrations || 0} registrations
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default CreatorProfile
