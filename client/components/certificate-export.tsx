"use client"

import { useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import {
    Download,
    Share2,
    FileText,
    Image,
    CheckCircle,
    AlertCircle,
    Copy,
    ExternalLink
} from "lucide-react"
import { CertificateGenerator, type CertificateData, type CertificateImage } from "@/lib/certificate"
import type { RegistryEntry } from "@/hooks/useRegistry"

interface CertificateExportProps {
    entry: RegistryEntry
    onClose?: () => void
}

export const CertificateExport = ({
    entry,
    onClose
}: CertificateExportProps) => {
    const [certificateData, setCertificateData] = useState<CertificateData | null>(null)
    const [certificateImage, setCertificateImage] = useState<CertificateImage | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [shareLink, setShareLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const generateCertificate = async () => {
        setIsGenerating(true)
        try {
            const cert = CertificateGenerator.generateCertificate(entry)
            setCertificateData(cert)

            const image = await CertificateGenerator.generateImageCertificate(cert, {
                width: 800,
                height: 600
            })
            setCertificateImage(image)

            const link = CertificateGenerator.generateShareableLink(cert)
            setShareLink(link)
        } catch (error) {
            console.error('Error generating certificate:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    const downloadJSON = () => {
        if (certificateData) {
            CertificateGenerator.downloadCertificate(certificateData, 'json')
        }
    }

    const downloadImage = async () => {
        if (certificateImage) {
            await CertificateGenerator.downloadImageCertificate(certificateImage)
        }
    }

    const copyShareLink = async () => {
        if (shareLink) {
            try {
                await navigator.clipboard.writeText(shareLink)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (error) {
                console.error('Failed to copy link:', error)
            }
        }
    }

    const formatHash = (hash: string) => {
        return hash
    }

    const formatAddress = (address: string) => {
        return address
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Export Certificate</h2>
                    <p className="text-slate-400">
                        Generate shareable proof of content authenticity
                    </p>
                </div>
                {onClose && (
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="border-slate-500 text-black hover:bg-slate-700 hover:text-white"
                    >
                        Close
                    </Button>
                )}
            </div>

            <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-white">Content Registration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-sm text-slate-400">Creator</label>
                            <div className="font-mono text-xs text-slate-300 break-all">
                                {formatAddress(entry.creator.toBase58())}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Timestamp</label>
                            <div className="text-sm text-slate-300">
                                {new Date(entry.timestamp * 1000).toLocaleString()}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm text-slate-400">Prompt Hash</label>
                            <div className="font-mono text-xs text-slate-300 break-all">
                                {formatHash(Array.from(entry.promptHash).map(b => b.toString(16).padStart(2, '0')).join(''))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm text-slate-400">Output Hash</label>
                            <div className="font-mono text-xs text-slate-300 break-all">
                                {formatHash(Array.from(entry.outputHash).map(b => b.toString(16).padStart(2, '0')).join(''))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {!certificateData && (
                <Card className="bg-slate-900/50 border-slate-700/50">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="text-slate-300">
                                Generate a verifiable certificate for this content registration
                            </div>
                            <Button
                                onClick={generateCertificate}
                                disabled={isGenerating}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Generate Certificate
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {certificateData && (
                <div className="space-y-4">
                    <Card className="bg-green-900/20 border-green-500/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="text-green-300 font-semibold">Certificate Generated</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="text-green-400">Certificate ID</label>
                                    <div className="font-mono text-green-300">
                                        {certificateData.certificateId}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-green-400">Version</label>
                                    <div className="text-green-300">
                                        {certificateData.version}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-green-400">Generated</label>
                                    <div className="text-green-300">
                                        {new Date(certificateData.generatedAt).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-green-400">Transaction</label>
                                    <div className="font-mono text-green-300">
                                        {formatHash(certificateData.transactionSignature)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-700/50">
                        <CardHeader>
                            <CardTitle className="text-white">Download Certificate</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button
                                    onClick={downloadJSON}
                                    variant="outline"
                                    className="border-slate-500 text-black hover:bg-slate-700 hover:text-white"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Download JSON
                                </Button>
                                <Button
                                    onClick={downloadImage}
                                    variant="outline"
                                    className="border-slate-500 text-black hover:bg-slate-700 hover:text-white"
                                >
                                    <Image className="w-4 h-4 mr-2" />
                                    Download Image
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {shareLink && (
                        <Card className="bg-slate-900/50 border-slate-700/50">
                            <CardHeader>
                                <CardTitle className="text-white">Share Certificate</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={shareLink}
                                        readOnly
                                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-300 text-sm font-mono"
                                    />
                                    <Button
                                        onClick={copyShareLink}
                                        variant="outline"
                                        className="border-slate-500 text-black hover:bg-slate-700 hover:text-white"
                                    >
                                        {copied ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                                <div className="text-sm text-slate-400">
                                    Share this link to provide verifiable proof of content authenticity
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {certificateImage && (
                        <Card className="bg-slate-900/50 border-slate-700/50">
                            <CardHeader>
                                <CardTitle className="text-white">Certificate Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-center">
                                    <img
                                        src={certificateImage.dataUrl}
                                        alt="Certificate Preview"
                                        className="max-w-full h-auto border border-slate-600 rounded"
                                        style={{ maxHeight: '400px' }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}

export default CertificateExport
