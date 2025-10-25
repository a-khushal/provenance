import { PublicKey } from "@solana/web3.js"
import type { RegistryEntry } from "@/hooks/useRegistry"

export interface CertificateData {
    promptHash: string
    outputHash: string
    creator: string
    timestamp: number
    blockTime: number
    transactionSignature: string
    programId: string
    certificateId: string
    generatedAt: number
    version: string
}

export interface CertificateImage {
    dataUrl: string
    width: number
    height: number
}

export class CertificateGenerator {
    private static readonly VERSION = "1.0.0"
    private static readonly PROGRAM_ID = "A2KsJCvSpBGJjrzUoX8CHT7GrcnBV6F8p43QLopTpCtN"

    static generateCertificate(
        entry: RegistryEntry,
        transactionSignature?: string,
        blockTime?: number
    ): CertificateData {
        const promptHashHex = Array.from(entry.promptHash)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
        
        const outputHashHex = Array.from(entry.outputHash)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')

        const blockTimeValue = blockTime || Math.floor(Date.now() / 1000)
        const txSig = transactionSignature || this.generateMockTransactionSignature(entry)

        return {
            promptHash: promptHashHex,
            outputHash: outputHashHex,
            creator: entry.creator.toBase58(),
            timestamp: entry.timestamp,
            blockTime: blockTimeValue,
            transactionSignature: txSig,
            programId: CertificateGenerator.PROGRAM_ID,
            certificateId: this.generateCertificateId(entry, txSig),
            generatedAt: Date.now(),
            version: CertificateGenerator.VERSION
        }
    }

    private static generateMockTransactionSignature(entry: RegistryEntry): string {
        const data = `${entry.creator.toBase58()}-${entry.timestamp}-${entry.promptHash.length}-${entry.outputHash.length}`
        const hash = this.simpleHash(data)
        return `${hash}${hash}${hash}${hash}`.substring(0, 88)
    }

    static generateCertificateId(entry: RegistryEntry, txSignature: string): string {
        const data = `${entry.creator.toBase58()}-${entry.timestamp}-${txSignature}`
        return this.simpleHash(data)
    }

    private static simpleHash(str: string): string {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }
        return Math.abs(hash).toString(16).padStart(8, '0')
    }

    static async generateImageCertificate(
        certificateData: CertificateData,
        options: {
            width?: number
            height?: number
            backgroundColor?: string
            textColor?: string
            borderColor?: string
        } = {}
    ): Promise<CertificateImage> {
        const {
            width = 800,
            height = 600,
            backgroundColor = '#0f172a',
            textColor = '#ffffff',
            borderColor = '#3b82f6'
        } = options

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!

        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)

        ctx.strokeStyle = borderColor
        ctx.lineWidth = 4
        ctx.strokeRect(20, 20, width - 40, height - 40)

        ctx.fillStyle = textColor
        ctx.font = 'bold 32px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('PROVENANCE CERTIFICATE', width / 2, 80)

        ctx.font = '18px Arial'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText('Content Authenticity Verification', width / 2, 110)

        ctx.font = '14px monospace'
        ctx.fillStyle = '#64748b'
        ctx.textAlign = 'left'
        ctx.fillText(`Certificate ID: ${certificateData.certificateId}`, 40, 160)

        ctx.font = '14px monospace'
        ctx.fillStyle = textColor
        ctx.fillText('Prompt Hash:', 40, 200)
        ctx.fillText(certificateData.promptHash, 40, 220)
        
        ctx.fillText('Output Hash:', 40, 250)
        ctx.fillText(certificateData.outputHash, 40, 270)

        ctx.font = '14px Arial'
        ctx.fillText(`Creator: ${certificateData.creator}`, 40, 300)
        ctx.fillText(`Registered: ${new Date(certificateData.timestamp * 1000).toLocaleString()}`, 40, 325)
        ctx.fillText(`Block Time: ${new Date(certificateData.blockTime * 1000).toLocaleString()}`, 40, 350)

        ctx.fillText('Transaction:', 40, 380)
        ctx.font = '12px monospace'
        ctx.fillText(certificateData.transactionSignature, 40, 400)

        ctx.font = '12px Arial'
        ctx.fillStyle = '#64748b'
        ctx.textAlign = 'center'
        ctx.fillText(`Generated on ${new Date(certificateData.generatedAt).toLocaleString()}`, width / 2, height - 40)
        ctx.fillText(`Version ${certificateData.version}`, width / 2, height - 20)

        return {
            dataUrl: canvas.toDataURL('image/png'),
            width,
            height
        }
    }

    static downloadCertificate(certificateData: CertificateData, format: 'json' | 'image' = 'json'): void {
        if (format === 'json') {
            const blob = new Blob([JSON.stringify(certificateData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `provenance-certificate-${certificateData.certificateId}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
    }

    static async downloadImageCertificate(certificateImage: CertificateImage): Promise<void> {
        const link = document.createElement('a')
        link.download = `provenance-certificate-${Date.now()}.png`
        link.href = certificateImage.dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    static generateShareableLink(certificateData: CertificateData): string {
        // In a real implementation, this would upload to a service and return a URL
        // For now, we'll create a data URL with the certificate
        const data = encodeURIComponent(JSON.stringify(certificateData))
        return `data:application/json;base64,${btoa(data)}`
    }

    static verifyCertificate(certificateData: CertificateData): {
        isValid: boolean
        errors: string[]
    } {
        const errors: string[] = []

        if (!certificateData.promptHash) errors.push('Missing prompt hash')
        if (!certificateData.outputHash) errors.push('Missing output hash')
        if (!certificateData.creator) errors.push('Missing creator')
        if (!certificateData.timestamp) errors.push('Missing timestamp')
        if (!certificateData.transactionSignature) errors.push('Missing transaction signature')
        if (!certificateData.certificateId) errors.push('Missing certificate ID')

        if (certificateData.timestamp > Date.now() / 1000) {
            errors.push('Invalid timestamp: future date')
        }

        if (certificateData.promptHash && !/^[0-9a-f]+$/i.test(certificateData.promptHash)) {
            errors.push('Invalid prompt hash format')
        }
        if (certificateData.outputHash && !/^[0-9a-f]+$/i.test(certificateData.outputHash)) {
            errors.push('Invalid output hash format')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }
}
