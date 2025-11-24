"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Coins, Plus, Minus } from "lucide-react"
import { useSession } from "next-auth/react"

interface CoinFlipProps {
    initialBalance: number
}

export default function CoinFlip({ initialBalance }: CoinFlipProps) {
    const { update } = useSession()
    const [balance, setBalance] = useState(initialBalance)
    const [bet, setBet] = useState(10)
    const [isFlipping, setIsFlipping] = useState(false)
    const [result, setResult] = useState<"HEADS" | "TAILS" | null>(null)
    const [win, setWin] = useState<boolean | null>(null)

    const handleBetChange = (amount: number) => {
        if (isFlipping) return
        const newBet = bet + amount
        if (newBet >= 10 && newBet <= 1000) {
            setBet(newBet)
        }
    }

    const processTransaction = async (action: "BET" | "WIN", amount: number) => {
        try {
            const res = await fetch("/api/game/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, amount, game: "COIN_FLIP" })
            })
            if (!res.ok) throw new Error("Transaction failed")
            const data = await res.json()
            setBalance(data.balance)
            update({ balance: data.balance }) // Update session
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    const play = async () => {
        if (isFlipping) return

        // 1. Deduct Bet
        const success = await processTransaction("BET", bet)
        if (!success) {
            alert("Insufficient funds or error!")
            return
        }

        setIsFlipping(true)
        setResult(null)
        setWin(null)

        // Simulate flip duration
        setTimeout(async () => {
            const outcome = Math.random() > 0.5 ? "HEADS" : "TAILS"
            const isWin = Math.random() > 0.5 // 50% chance

            setResult(outcome)
            setWin(isWin)

            // 2. Add Win if applicable
            if (isWin) {
                await processTransaction("WIN", bet * 2)
            }

            setIsFlipping(false)
        }, 2000)
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
            {/* Game Area */}
            <div className="relative w-64 h-64 mb-12 perspective-1000">
                <motion.div
                    className="w-full h-full relative preserve-3d"
                    animate={{
                        rotateY: isFlipping ? 1800 : 0,
                        rotateX: isFlipping ? 720 : 0
                    }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                >
                    {/* Coin Visual */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 border-4 border-yellow-200 shadow-[0_0_50px_rgba(234,179,8,0.3)] flex items-center justify-center backface-hidden ${result === "TAILS" && !isFlipping ? "hidden" : ""}`}>
                        <span className="text-6xl font-bold text-yellow-900">H</span>
                    </div>
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 border-4 border-yellow-200 shadow-[0_0_50px_rgba(234,179,8,0.3)] flex items-center justify-center backface-hidden rotate-y-180 ${result === "HEADS" && !isFlipping ? "hidden" : ""}`}>
                        <span className="text-6xl font-bold text-yellow-900">T</span>
                    </div>
                </motion.div>
            </div>

            {/* Result Display */}
            <div className="h-16 mb-8 flex items-center justify-center">
                <AnimatePresence>
                    {!isFlipping && win !== null && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className={`text-4xl font-black tracking-wider ${win ? "text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" : "text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]"}`}
                        >
                            {win ? "YOU WIN!" : "YOU LOSE!"}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="w-full bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6">
                {/* Balance & Bet Info */}
                <div className="flex justify-between items-center text-sm font-medium text-neutral-400">
                    <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span>Balance: <span className="text-white">${balance.toFixed(2)}</span></span>
                    </div>
                    <div>
                        Current Bet: <span className="text-white">${bet}</span>
                    </div>
                </div>

                {/* Bet Adjustment */}
                <div className="flex items-center justify-between gap-4 bg-black/20 p-2 rounded-xl">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleBetChange(-10)}
                        disabled={isFlipping || bet <= 10}
                        className="text-white hover:bg-white/10"
                    >
                        <Minus className="w-5 h-5" />
                    </Button>

                    <span className="text-2xl font-bold text-white font-mono w-24 text-center">
                        {bet}
                    </span>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleBetChange(10)}
                        disabled={isFlipping || bet >= 1000}
                        className="text-white hover:bg-white/10"
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                {/* Play Button */}
                <Button
                    onClick={play}
                    disabled={isFlipping}
                    className="w-full h-14 text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black shadow-lg shadow-orange-500/20 rounded-xl transition-all active:scale-95"
                >
                    {isFlipping ? "FLIPPING..." : "FLIP COIN"}
                </Button>
            </div>
        </div>
    )
}
