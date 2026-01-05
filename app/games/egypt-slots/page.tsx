"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import GameLayout from "@/components/GameLayout"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

export default function EgyptSlotsPage() {
    const { update } = useSession()
    const [spinning, setSpinning] = useState(false)
    const [grid, setGrid] = useState<string[][]>([
        ["📖", "🤴", "🐕", "🪲", "☥"],
        ["🅰️", "🇰", "🇶", "🇯", "🔟"],
        ["📖", "🤴", "🐕", "🪲", "☥"]
    ])
    const [winningLines, setWinningLines] = useState<number[]>([])
    const [lastWin, setLastWin] = useState(0)

    // Manual Inputs
    const [betPerLine, setBetPerLine] = useState<string>("10")
    const [lines, setLines] = useState<number>(10) // Fixed 10 lines usually for this type, or adjustable. Let's make it adjustable 1-10.

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
                    gameId: "egypt-slots",
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
            const symbols = ["📖", "🤴", "🐕", "🪲", "☥", "🅰️", "🇰", "🇶", "🇯", "🔟"]

            const interval = setInterval(() => {
                setGrid(prev => prev.map(row => row.map(() =>
                    symbols[Math.floor(Math.random() * symbols.length)]
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
        <GameLayout title="Mystic Nile Gold" currentBet={totalBet} lastWin={lastWin}>
            <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-2">

                {/* Slot Machine Frame - Egyptian Theme */}
                <div className="relative bg-gradient-to-b from-yellow-700 via-yellow-600 to-yellow-800 p-3 md:p-8 rounded-t-full rounded-b-3xl shadow-2xl border-x-8 border-t-8 border-yellow-900 mb-6 md:mb-12 w-full">

                    {/* Decorative Header */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-yellow-900 text-yellow-400 px-8 py-2 rounded-t-xl border-t-4 border-yellow-600 shadow-lg hidden md:block">
                        <h2 className="text-2xl font-bold tracking-widest uppercase text-shadow-sm">Mystic Nile</h2>
                    </div>

                    {/* Columns Decoration */}
                    <div className="absolute top-0 bottom-0 left-0 w-4 md:w-8 bg-gradient-to-r from-yellow-900 to-yellow-600 border-r border-yellow-950 rounded-l-3xl" />
                    <div className="absolute top-0 bottom-0 right-0 w-4 md:w-8 bg-gradient-to-l from-yellow-900 to-yellow-600 border-l border-yellow-950 rounded-r-3xl" />

                    {/* Screen Container */}
                    <div className="bg-black/80 p-2 md:p-4 rounded-xl border-4 border-yellow-500/30 shadow-inner relative mx-4 md:mx-6">

                        {/* Grid */}
                        <div className="grid grid-rows-3 gap-1 md:gap-2">
                            {grid.map((row, rowIndex) => (
                                <div key={rowIndex} className="grid grid-cols-5 gap-1 md:gap-2">
                                    {row.map((symbol, colIndex) => (
                                        <div
                                            key={colIndex}
                                            className={cn(
                                                "w-12 h-16 md:w-24 md:h-28 bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg flex items-center justify-center text-3xl md:text-5xl shadow-inner border border-yellow-900/50 relative overflow-hidden",
                                                spinning && "blur-[1px]",
                                            )}
                                        >
                                            {/* Symbol shine effect */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

                                            <span className="drop-shadow-lg filter brightness-110">
                                                {symbol}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Paylines Indicators Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Can add SVGs here for lines later */}
                        </div>
                    </div>

                    {/* Torches (Animated placeholder) */}
                    <div className="absolute top-1/2 -left-2 md:-left-6 w-4 h-12 md:w-6 md:h-16 bg-orange-500 blur-md animate-pulse rounded-full opacity-60" />
                    <div className="absolute top-1/2 -right-2 md:-right-6 w-4 h-12 md:w-6 md:h-16 bg-orange-500 blur-md animate-pulse rounded-full opacity-60" />
                </div>

                {/* Controls Panel */}
                <div className="w-full bg-slate-950/90 p-4 md:p-6 rounded-xl border border-yellow-900/30 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">

                    {/* Settings Group */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 w-full md:w-auto">

                        {/* Bet Per Line */}
                        <div className="flex flex-col gap-1 items-center">
                            <label className="text-[10px] md:text-xs text-yellow-500/70 font-bold uppercase tracking-wider">Bet / Line</label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 md:h-10 md:w-10 border-yellow-900/50 text-yellow-500 hover:bg-yellow-900/20"
                                    onClick={() => setBetPerLine(prev => Math.max(1, (parseFloat(prev) || 0) - 1).toString())}
                                >-</Button>
                                <Input
                                    type="number"
                                    value={betPerLine}
                                    onChange={(e) => setBetPerLine(e.target.value)}
                                    className="bg-black/50 border-yellow-900/50 text-yellow-400 text-center font-mono w-16 md:w-20 h-8 md:h-10"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 md:h-10 md:w-10 border-yellow-900/50 text-yellow-500 hover:bg-yellow-900/20"
                                    onClick={() => setBetPerLine(prev => ((parseFloat(prev) || 0) + 1).toString())}
                                >+</Button>
                            </div>
                        </div>

                        {/* Lines Selection */}
                        <div className="flex flex-col gap-1 items-center">
                            <label className="text-[10px] md:text-xs text-yellow-500/70 font-bold uppercase tracking-wider">Lines</label>
                            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-yellow-900/30">
                                {[1, 5, 10].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setLines(num)}
                                        className={cn(
                                            "px-2 md:px-3 py-1 rounded text-xs md:text-sm font-bold transition-all",
                                            lines === num
                                                ? "bg-yellow-600 text-black shadow-lg"
                                                : "text-yellow-600/50 hover:text-yellow-500"
                                        )}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Center Display */}
                    <div className="bg-black/60 px-6 py-2 rounded-lg border border-yellow-900/30 flex flex-col items-center min-w-[150px]">
                        <span className="text-[10px] text-yellow-500/50 uppercase tracking-widest">Total Stake</span>
                        <span className="text-xl md:text-2xl font-mono font-bold text-yellow-400">${totalBet.toFixed(2)}</span>
                    </div>

                    {/* Spin Actions */}
                    <div className="w-full md:w-auto">
                        <Button
                            onClick={spin}
                            disabled={spinning || totalBet <= 0}
                            className="w-full md:w-40 h-14 md:h-16 bg-gradient-to-b from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white text-xl font-bold uppercase tracking-widest shadow-lg shadow-green-900/20 border-b-4 border-green-950 active:border-b-0 active:translate-y-1 rounded-xl transition-all"
                        >
                            {spinning ? <span className="animate-spin text-2xl">↻</span> : "SPIN"}
                        </Button>
                    </div>

                </div>

                {/* Big Win Effect */}
                <AnimatePresence>
                    {lastWin > 0 && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
                        >
                            <div className="bg-black/90 p-8 md:p-12 rounded-3xl border-4 border-yellow-500 text-center shadow-2xl shadow-yellow-500/20 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent animate-shimmer" />
                                <h3 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-4 drop-shadow-sm filter">BIG WIN!</h3>
                                <p className="text-2xl md:text-4xl text-white font-bold mb-2">
                                    ${lastWin.toFixed(2)}
                                </p>
                                <p className="text-yellow-400/80 uppercase tracking-widest text-sm">Congratulations!</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </GameLayout>
    )
}
