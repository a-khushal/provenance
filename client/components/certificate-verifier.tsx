"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { 
    Upload, 
    CheckCircle, 
    AlertCircle, 
    FileText, 
    Shield,
} from "lucide-react"
import { CertificateGenerator, type CertificateData } from "@/lib/certificate"

interface CertificateVerifierProps {
    onVerified?: (certificateData: CertificateData) => void
}

export const CertificateVerifier = ({ onVerified }: CertificateVerifierProps) => {
    const [certificateData, setCertificateData] = useState<CertificateData | null>(null)
    const [verificationResult, setVerificationResult] = useState<{
        isValid: boolean
        errors: string[]
    } | null>(null)
    const [isVerifying, setIsVerifying] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    const handleFileUpload = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const data = JSON.parse(content) as CertificateData
                setCertificateData(data)
                verifyCertificate(data)
            } catch (error) {
                console.error('Error parsing certificate:', error)
                setVerificationResult({
                    isValid: false,
                    errors: ['Invalid certificate format']
                })
            }
        }
        reader.readAsText(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            handleFileUpload(files[0])
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
    }

    const verifyCertificate = (data: CertificateData) => {
        setIsVerifying(true)
        try {
            const result = CertificateGenerator.verifyCertificate(data)
            setVerificationResult(result)
            if (result.isValid && onVerified) {
                onVerified(data)
            }
        } catch (error) {
            console.error('Error verifying certificate:', error)
            setVerificationResult({
                isValid: false,
                errors: ['Verification failed']
            })
        } finally {
            setIsVerifying(false)
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
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Certificate Verifier</h2>
                <p className="text-slate-400">
                    Upload and verify provenance certificates
                </p>
            </div>

            {!certificateData && (
                <Card className="bg-slate-900/50 border-slate-700/50">
                    <CardContent className="pt-6">
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                dragActive
                                    ? 'border-blue-500 bg-blue-900/20'
                                    : 'border-slate-600 hover:border-slate-500'
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <div className="text-slate-300 mb-2">
                                Drop your certificate file here
                            </div>
                            <div className="text-slate-400 text-sm mb-4">
                                or click to browse
                            </div>
                            <input
                                type="file"
                                accept=".json"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleFileUpload(file)
                                }}
                                className="hidden"
                                id="certificate-upload"
                            />
                            <Button
                                onClick={() => document.getElementById('certificate-upload')?.click()}
                                variant="outline"
                                className="border-slate-500 text-black hover:bg-slate-700 hover:text-white"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Choose File
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {certificateData && (
                <div className="space-y-4">
                    <Card className={`${
                        verificationResult?.isValid 
                            ? 'bg-green-900/20 border-green-500/50' 
                            : 'bg-red-900/20 border-red-500/50'
                    }`}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                {verificationResult?.isValid ? (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                )}
                                <span className={`font-semibold ${
                                    verificationResult?.isValid ? 'text-green-300' : 'text-red-300'
                                }`}>
                                    {verificationResult?.isValid ? 'Certificate Valid' : 'Certificate Invalid'}
                                </span>
                            </div>
                            
                            {verificationResult?.errors && verificationResult.errors.length > 0 && (
                                <div className="space-y-2">
                                    <div className="text-red-300 text-sm font-medium">Issues found:</div>
                                    <ul className="list-disc list-inside space-y-1">
                                        {verificationResult.errors.map((error, index) => (
                                            <li key={index} className="text-red-400 text-sm">
                                                {error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-700/50">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Certificate Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400">Certificate ID</label>
                                    <div className="font-mono text-xs text-slate-300 break-all">
                                        {certificateData.certificateId}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Version</label>
                                    <div className="text-sm text-slate-300">
                                        {certificateData.version}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm text-slate-400">Creator</label>
                                    <div className="font-mono text-xs text-slate-300 break-all">
                                        {formatAddress(certificateData.creator)}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Registered</label>
                                    <div className="text-sm text-slate-300">
                                        {new Date(certificateData.timestamp * 1000).toLocaleString()}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm text-slate-400">Prompt Hash</label>
                                    <div className="font-mono text-xs text-slate-300 break-all">
                                        {formatHash(certificateData.promptHash)}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm text-slate-400">Output Hash</label>
                                    <div className="font-mono text-xs text-slate-300 break-all">
                                        {formatHash(certificateData.outputHash)}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm text-slate-400">Transaction</label>
                                    <div className="font-mono text-xs text-slate-300 break-all">
                                        {formatHash(certificateData.transactionSignature)}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400">Generated</label>
                                    <div className="text-sm text-slate-300">
                                        {new Date(certificateData.generatedAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={() => {
                                        setCertificateData(null)
                                        setVerificationResult(null)
                                    }}
                                    variant="outline"
                                    className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white"
                                >
                                    Verify Another
                                </Button>
                                {verificationResult?.isValid && (
                                    <Button
                                        onClick={() => {
                                            console.log('Certificate verified:', certificateData)
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        View Content
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default CertificateVerifier
