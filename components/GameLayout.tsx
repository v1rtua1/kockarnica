"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Coins, Trophy, Wallet } from "lucide-react"
import { motion } from "framer-motion"

interface GameLayoutProps {
    children: React.ReactNode
    title: string
    currentBet?: number
    lastWin?: number
}

export default function GameLayout({ children, title, currentBet = 0, lastWin = 0 }: GameLayoutProps) {
    const { data: session } = useSession()

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Top Bar */}
            <header className="bg-slate-900/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6 text-sm font-medium">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="hidden sm:inline">Bet:</span>
                            <span className="text-white">${currentBet.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                            <Trophy className="w-4 h-4 text-green-500" />
                            <span className="hidden sm:inline">Win:</span>
                            <motion.span
                                key={lastWin}
                                initial={{ scale: 1.2, color: "#22c55e" }}
                                animate={{ scale: 1, color: lastWin > 0 ? "#22c55e" : "#ffffff" }}
                                className="text-white"
                            >
                                ${lastWin.toFixed(2)}
                            </motion.span>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/10">
                            <Wallet className="w-4 h-4 text-blue-500" />
                            <span className="text-slate-200">${session?.user?.balance?.toFixed(2) || "0.00"}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Game Content */}
            <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 w-full max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
