"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import GameLayout from "@/components/GameLayout"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"

export default function ClassicSlotsPage() {
    const { update } = useSession()
    const [spinning, setSpinning] = useState(false)
    const [grid, setGrid] = useState<string[][]>([
        ["🍒", "🍒", "🍒"],
        ["🍒", "🍒", "🍒"],
        ["🍒", "🍒", "🍒"]
    ])
    const [winningLines, setWinningLines] = useState<number[]>([])
    const [lastWin, setLastWin] = useState(0)

    // Manual Inputs
    const [betPerLine, setBetPerLine] = useState<string>("10")
    const [lines, setLines] = useState<number>(1)

    const totalBet = (parseFloat(betPerLine) || 0) * lines

    const spin = async () => {
        if (spinning || totalBet <= 0) return

        setSpinning(true)
        setLastWin(0)
        setWinningLines([])

        try {
            const res = await fetch("/api/game/play", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gameId: "classic-slots",
                    bet: totalBet,
                    params: { lines }
                })
            })

            if (!res.ok) {
                const error = await res.json()
                alert(error.error || "Something went wrong")
                setSpinning(false)
                return
            }

            const data = await res.json()

            // Simulate spin animation
            const spinDuration = 2000
            const interval = setInterval(() => {
                setGrid(prev => prev.map(row => row.map(() =>
                    ["🍒", "🍋", "🍊", "🍇", "🔔", "💎", "7️⃣"][Math.floor(Math.random() * 7)]
                )))
            }, 100)

            setTimeout(() => {
                clearInterval(interval)
                setGrid(data.result.grid)
                setWinningLines(data.result.winningLines)
                setLastWin(data.payout)
                update({ balance: data.balance })
                setSpinning(false)
            }, spinDuration)

        } catch (error) {
            console.error(error)
            setSpinning(false)
        }
    }

    return (
        <GameLayout title="Classic Slots" currentBet={totalBet} lastWin={lastWin}>
            <div className="flex flex-col items-center w-full max-w-4xl mx-auto">

                {/* Slot Machine Frame */}
                <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 p-8 rounded-3xl shadow-2xl border-4 border-yellow-900 relative mb-12">
                    {/* Screen */}
                    <div className="bg-black p-4 rounded-xl border-4 border-yellow-500/50 shadow-inner overflow-hidden relative">
                        {/* Grid */}
                        <div className="grid grid-rows-3 gap-2">
                            {grid.map((row, rowIndex) => (
                                <div key={rowIndex} className="grid grid-cols-3 gap-2">
                                    {row.map((symbol, colIndex) => (
                                        <div
                                            key={colIndex}
                                            className={cn(
                                                "w-24 h-24 bg-white rounded-lg flex items-center justify-center text-5xl shadow-inner border-2 border-slate-200",
                                                spinning && "blur-sm",
                                                // Highlight winning lines logic could be complex visually, 
                                                // for now just highlight if part of any win? 
                                                // Or simpler: just show the grid.
                                            )}
                                        >
                                            {symbol}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Paylines Indicators (Simplified) */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* We can visualize lines here if needed, but for now let's keep it clean */}
                        </div>
                    </div>

                    {/* Decorative Lights */}
                    <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                </div>

                {/* Controls */}
                <div className="w-full bg-slate-900/80 p-6 rounded-xl border border-white/10 backdrop-blur-sm flex flex-col md:flex-row gap-8 items-end justify-center">

                    {/* Bet Per Line */}
                    <div className="w-full md:w-auto">
                        <label className="text-sm text-slate-400 mb-2 block font-bold uppercase tracking-wider">Bet Per Line</label>
                        <Input
                            type="number"
                            value={betPerLine}
                            onChange={(e) => setBetPerLine(e.target.value)}
                            className="bg-slate-950 border-slate-700 text-white text-xl h-14 w-full md:w-40 text-center font-mono"
                        />
                    </div>

                    {/* Lines Selection */}
                    <div className="w-full md:w-auto">
                        <label className="text-sm text-slate-400 mb-2 block font-bold uppercase tracking-wider">Lines (1-5)</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setLines(num)}
                                    className={cn(
                                        "w-10 h-14 rounded-md font-bold text-lg transition-all border-b-4 active:border-b-0 active:translate-y-1",
                                        lines === num
                                            ? "bg-yellow-500 border-yellow-700 text-black"
                                            : "bg-slate-800 border-slate-950 text-slate-400 hover:bg-slate-700"
                                    )}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Total Bet Display */}
                    <div className="flex flex-col items-center justify-center h-14 px-4 bg-black/40 rounded-lg border border-white/5">
                        <span className="text-xs text-slate-500 uppercase font-bold">Total Bet</span>
                        <span className="text-xl text-yellow-400 font-mono font-bold">${totalBet.toFixed(2)}</span>
                    </div>

                    {/* Spin Button */}
                    <Button
                        onClick={spin}
                        disabled={spinning || totalBet <= 0}
                        className="bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white h-20 w-full md:w-48 text-2xl font-bold shadow-xl shadow-red-900/40 border-b-4 border-red-950 active:border-b-0 active:translate-y-1 rounded-xl uppercase tracking-widest"
                    >
                        {spinning ? "..." : "SPIN"}
                    </Button>
                </div>

                {/* Winning Lines Display */}
                {lastWin > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/50 rounded-xl text-center"
                    >
                        <h3 className="text-2xl font-bold text-yellow-400 mb-2">BIG WIN!</h3>
                        <p className="text-white text-lg">
                            You won <span className="font-bold text-green-400">${lastWin}</span> on lines: {winningLines.join(", ")}
                        </p>
                    </motion.div>
                )}
            </div>
        </GameLayout>
    )
}
