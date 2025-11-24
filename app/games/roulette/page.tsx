"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import GameLayout from "@/components/GameLayout"
import { useSession } from "next-auth/react"
import { motion, useAnimation } from "framer-motion"

// European Roulette Wheel Order
const WHEEL_NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

export default function RoulettePage() {
    const { update } = useSession()
    const [spinning, setSpinning] = useState(false)
    const [result, setResult] = useState<number | null>(null)
    const [bets, setBets] = useState<Record<string, number>>({})
    const [lastWin, setLastWin] = useState(0)
    const [manualBetAmount, setManualBetAmount] = useState<string>("10")

    const controls = useAnimation()

    const totalBet = Object.values(bets).reduce((a, b) => a + b, 0)

    const processTransaction = async (action: "BET" | "WIN", amount: number) => {
        try {
            const res = await fetch("/api/game/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, amount, game: "ROULETTE" })
            })
            if (!res.ok) throw new Error("Transaction failed")
            const data = await res.json()
            update({ balance: data.balance })
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    const placeBet = (type: string) => {
        if (spinning) return
        const amount = parseFloat(manualBetAmount)
        if (isNaN(amount) || amount <= 0) return

        setBets(prev => ({
            ...prev,
            [type]: (prev[type] || 0) + amount
        }))
    }

    const spin = async () => {
        if (spinning || totalBet === 0) return

        const success = await processTransaction("BET", totalBet)
        if (!success) {
            alert("Insufficient funds or error!")
            return
        }

        setSpinning(true)
        setLastWin(0)
        setResult(null)

        // RIGGED LOGIC: 80% chance to force a loss
        const forceLoss = Math.random() < 0.8
        let winningNumber: number

        if (forceLoss) {
            // Find numbers that result in 0 win or loss
            const losingNumbers = WHEEL_NUMBERS.filter(num => {
                let potentialWin = 0
                // Exact match
                if (bets[num.toString()]) potentialWin += bets[num.toString()] * 36
                // Red/Black
                const isRed = RED_NUMBERS.includes(num)
                if (isRed && bets['red']) potentialWin += bets['red'] * 2
                if (!isRed && num !== 0 && bets['black']) potentialWin += bets['black'] * 2

                return potentialWin === 0 // Strict loss (house takes all)
            })

            if (losingNumbers.length > 0) {
                winningNumber = losingNumbers[Math.floor(Math.random() * losingNumbers.length)]
            } else {
                // If player covered everything (rare), pick lowest payout or random
                winningNumber = WHEEL_NUMBERS[Math.floor(Math.random() * WHEEL_NUMBERS.length)]
            }
        } else {
            // Fair spin
            winningNumber = WHEEL_NUMBERS[Math.floor(Math.random() * WHEEL_NUMBERS.length)]
        }

        // Calculate rotation
        // Each segment is 360/37 degrees
        const segmentAngle = 360 / 37
        const winningIndex = WHEEL_NUMBERS.indexOf(winningNumber)

        // We want the winning number to be at the top (0 degrees)
        // But the wheel renders 0 at the top by default.
        // If we rotate clockwise, we need to rotate enough so that the winning index hits the top.
        // Let's say we do 5 full spins + angle to target.
        const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8) // Add some randomness within the segment
        const rotation = 360 * 5 + (360 - (winningIndex * segmentAngle)) + randomOffset

        await controls.start({
            rotate: rotation,
            transition: { duration: 4, ease: "easeOut" }
        })

        setResult(winningNumber)
        setSpinning(false)
        calculateWinnings(winningNumber)

        // Reset rotation for next spin (optional, but keeps numbers aligned)
        controls.set({ rotate: rotation % 360 })
    }

    const calculateWinnings = async (number: number) => {
        let win = 0
        // Exact number match pays 35:1
        if (bets[number.toString()]) {
            win += bets[number.toString()] * 36
        }
        // Red/Black logic
        const isRed = RED_NUMBERS.includes(number)
        if (isRed && bets['red']) win += bets['red'] * 2
        if (!isRed && number !== 0 && bets['black']) win += bets['black'] * 2

        setLastWin(win)
        setBets({}) // Clear bets

        if (win > 0) {
            await processTransaction("WIN", win)
        }
    }

    return (
        <GameLayout title="European Roulette" currentBet={totalBet} lastWin={lastWin}>
            <div className="flex flex-col items-center w-full max-w-6xl mx-auto">

                {/* Wheel Section */}
                <div className="relative mb-12 scale-75 md:scale-100">
                    {/* Pointer */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-yellow-400 drop-shadow-lg" />

                    {/* Wheel Container */}
                    <motion.div
                        className="w-80 h-80 rounded-full border-8 border-yellow-600 bg-slate-900 shadow-2xl shadow-yellow-900/50 relative overflow-hidden"
                        animate={controls}
                    >
                        {/* Wheel Segments */}
                        {WHEEL_NUMBERS.map((num, i) => {
                            const angle = (360 / 37) * i
                            const isRed = RED_NUMBERS.includes(num)
                            const isGreen = num === 0
                            return (
                                <div
                                    key={num}
                                    className="absolute top-0 left-1/2 w-[1px] h-1/2 origin-bottom"
                                    style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
                                >
                                    <div
                                        className={cn(
                                            "absolute -top-0 -left-[12px] w-[24px] h-[140px] flex justify-center pt-1 text-[10px] font-bold text-white",
                                            isGreen ? "bg-green-700" : isRed ? "bg-red-700" : "bg-zinc-900"
                                        )}
                                        style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                                    >
                                        <span className="transform rotate-180">{num}</span>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Center Hub */}
                        <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 shadow-inner flex items-center justify-center z-10 border-4 border-yellow-800">
                            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">
                                    {result !== null ? result : "?"}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Controls Section */}
                <div className="w-full max-w-4xl bg-slate-900/50 p-6 rounded-xl border border-white/10 backdrop-blur-sm">

                    {/* Bet Input */}
                    <div className="flex justify-center mb-8 gap-4 items-end">
                        <div className="w-full max-w-xs">
                            <label className="text-sm text-slate-400 mb-2 block">Bet Amount ($)</label>
                            <Input
                                type="number"
                                value={manualBetAmount}
                                onChange={(e) => setManualBetAmount(e.target.value)}
                                className="bg-slate-950 border-slate-700 text-white text-lg h-12"
                            />
                        </div>
                        <Button
                            onClick={() => spin()}
                            disabled={spinning || totalBet === 0}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black h-12 px-8 text-xl font-bold shadow-lg shadow-yellow-500/20"
                        >
                            {spinning ? "Spinning..." : "SPIN"}
                        </Button>
                    </div>

                    {/* Betting Table */}
                    <div className="flex flex-col gap-4">
                        {/* Red/Black */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                onClick={() => placeBet('red')}
                                className="bg-red-600 hover:bg-red-500 h-16 text-lg font-bold relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                <span className="relative z-10">RED x2</span>
                                {bets['red'] && (
                                    <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                                        ${bets['red']}
                                    </div>
                                )}
                            </Button>
                            <Button
                                onClick={() => placeBet('black')}
                                className="bg-slate-800 hover:bg-slate-700 h-16 text-lg font-bold relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                <span className="relative z-10">BLACK x2</span>
                                {bets['black'] && (
                                    <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                                        ${bets['black']}
                                    </div>
                                )}
                            </Button>
                        </div>

                        {/* Numbers Grid */}
                        <div className="grid grid-cols-12 gap-1 sm:gap-2">
                            {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                                <button
                                    key={num}
                                    onClick={() => placeBet(num.toString())}
                                    className={cn(
                                        "aspect-square font-bold border border-white/5 rounded transition-all hover:scale-105 relative flex items-center justify-center text-sm sm:text-base",
                                        RED_NUMBERS.includes(num) ? "bg-red-600 hover:bg-red-500" : "bg-slate-800 hover:bg-slate-700",
                                        bets[num.toString()] && "ring-2 ring-yellow-400 z-10"
                                    )}
                                >
                                    {num}
                                    {bets[num.toString()] && (
                                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-20">
                                            ${bets[num.toString()]}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Zero */}
                        <button
                            onClick={() => placeBet("0")}
                            className={cn(
                                "w-full h-12 font-bold border border-white/5 rounded transition-all hover:scale-105 relative flex items-center justify-center bg-green-600 hover:bg-green-500",
                                bets["0"] && "ring-2 ring-yellow-400 z-10"
                            )}
                        >
                            0
                            {bets["0"] && (
                                <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                                    ${bets["0"]}
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </GameLayout>
    )
}
