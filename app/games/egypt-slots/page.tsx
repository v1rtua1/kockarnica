"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
// REMOVE GameLayout to have full control of mobile screen
// import GameLayout from "@/components/GameLayout"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Menu, Zap, PlayCircle, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function EgyptSlotsPage() {
    const { data: session, update } = useSession()
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
    const [lines, setLines] = useState<number>(10)

    // Quick Spin & Autoplay Toggles (Visual only for now)
    const [quickSpin, setQuickSpin] = useState(false)

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
            const spinDuration = quickSpin ? 500 : 2000
            const symbols = ["📖", "🤴", "🐕", "🪲", "☥", "🅰️", "🇰", "🇶", "🇯", "🔟"]

            const interval = setInterval(() => {
                setGrid(prev => prev.map(row => row.map(() =>
                    symbols[Math.floor(Math.random() * symbols.length)]
                )))
            }, 50)

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
        <div className="flex flex-col h-[100dvh] w-full bg-slate-950 overflow-hidden relative text-white font-sans selection:bg-yellow-500/30">

            {/* Background Texture/Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 pointer-events-none" />
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none mix-blend-overlay" />

            {/* Top Bar (Mobile Application Header) */}
            <header className="flex items-center justify-between p-4 z-20 h-16 bg-slate-900/50 backdrop-blur-md border-b border-white/5">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/5">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                </Link>

                <h1 className="text-lg font-bold tracking-widest uppercase text-yellow-500 font-serif drop-shadow-sm">
                    Pharaoh's Quest
                </h1>

                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/5">
                    <Settings className="w-6 h-6" />
                </Button>
            </header>

            {/* Main Game Area (Reels) - Takes available space */}
            <main className="flex-1 flex flex-col items-center justify-center p-2 relative z-10 w-full max-w-lg mx-auto">

                {/* Frame */}
                <div className="relative w-full aspect-[5/3] bg-gradient-to-b from-yellow-700 via-yellow-500 to-yellow-800 p-1 rounded-xl shadow-2xl border-2 border-yellow-900 ring-4 ring-yellow-900/50 ring-offset-2 ring-offset-black/50">

                    {/* Inner Screen */}
                    <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden border-2 border-yellow-600/50 relative">
                        {/* Grid */}
                        <div className="w-full h-full grid grid-cols-5 bg-black/50">
                            {/* We need to transpose the grid for proper column animation eventually, but keeping row-based for simplified logic now */}
                            {/* But for map rendering, usually slots render columns. Here grid is row-major. Let's render columns vertically. 
                                Actually the data structure is grid[row][col]. Render by column for better CSS Grid if we want vertical separators.
                                Let's stick to simple grid-cols-5. 
                            */}
                            {Array.from({ length: 5 }).map((_, colIndex) => (
                                <div key={colIndex} className="flex flex-col border-r border-yellow-500/10 last:border-r-0 relative">
                                    {/* Render 3 rows for this column */}
                                    {Array.from({ length: 3 }).map((_, rowIndex) => {
                                        // Safety check
                                        const symbol = grid[rowIndex]?.[colIndex] || "?"

                                        return (
                                            <div key={rowIndex} className="flex-1 flex items-center justify-center border-b border-yellow-500/5 last:border-b-0">
                                                <div
                                                    className={cn(
                                                        "text-4xl sm:text-5xl transition-all duration-100 filter drop-shadow-lg transform",
                                                        spinning && "blur-[2px] scale-90 opacity-80 translate-y-4" // Simple blur effect
                                                    )}
                                                >
                                                    {symbol}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Paylines Overlay */}
                        <div className="absolute inset-0 pointer-events-none z-20">
                            {/* Line visualizations would go here */}
                        </div>

                        {/* Big Win Overlay in Screen */}
                        <AnimatePresence>
                            {lastWin > 0 && !spinning && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.5 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30"
                                >
                                    <div className="text-center">
                                        <div className="text-yellow-400 font-bold text-3xl uppercase tracking-widest drop-shadow-md animate-pulse">Big Win</div>
                                        <div className="text-white font-mono text-2xl font-bold">${lastWin.toFixed(2)}</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Info Bar under reels */}
                <div className="w-full flex justify-between items-center mt-4 px-2 text-xs font-semibold text-slate-400 tracking-wider">
                    <div className="flex flex-col items-start bg-slate-900/50 px-3 py-1 rounded-lg border border-white/5">
                        <span className="text-[10px] uppercase text-slate-500">Balance</span>
                        <span className="text-white text-sm font-mono">${session?.user?.balance?.toFixed(2) || "0.00"}</span>
                    </div>

                    <div className="flex flex-col items-end bg-slate-900/50 px-3 py-1 rounded-lg border border-white/5">
                        <span className="text-[10px] uppercase text-slate-500">Win</span>
                        <span className={cn("text-sm font-mono transition-colors", lastWin > 0 ? "text-green-400" : "text-white")}>
                            ${lastWin.toFixed(2)}
                        </span>
                    </div>
                </div>

            </main>

            {/* Bottom Controls Panel (The Deck) */}
            <footer className="w-full bg-slate-900 p-4 pb-8 z-20 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5 relative">

                {/* Decorative gold line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-yellow-500/50 rounded-full mb-2" />

                <div className="flex flex-col gap-4 max-w-lg mx-auto">

                    {/* Bet Controls Row */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 bg-slate-950/50 p-1.5 rounded-full border border-white/5">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 rounded-full text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                onClick={() => setBetPerLine(prev => Math.max(1, (parseFloat(prev) || 0) * 0.5).toString())}
                            >
                                <span className="text-xl font-bold">-</span>
                            </Button>

                            <div className="flex flex-col items-center min-w-[60px]">
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Bet</span>
                                <span className="text-white font-mono font-bold">${totalBet.toFixed(2)}</span>
                            </div>

                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 rounded-full text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                onClick={() => setBetPerLine(prev => ((parseFloat(prev) || 0) * 2).toString())}
                            >
                                <span className="text-xl font-bold">+</span>
                            </Button>
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-2">
                            <Button
                                size="icon"
                                variant={quickSpin ? "default" : "outline"}
                                className={cn(
                                    "h-10 w-10 rounded-full border-white/10 transition-all",
                                    quickSpin ? "bg-yellow-600 hover:bg-yellow-500 text-white" : "text-slate-500 hover:text-white"
                                )}
                                onClick={() => setQuickSpin(!quickSpin)}
                            >
                                <Zap className={cn("w-4 h-4", quickSpin && "fill-current")} />
                            </Button>
                        </div>
                    </div>

                    {/* Main Action Button */}
                    <Button
                        onClick={spin}
                        disabled={spinning || totalBet <= 0}
                        className={cn(
                            "w-full h-16 rounded-2xl text-2xl font-black uppercase tracking-widest shadow-lg transition-all transform active:scale-[0.98]",
                            "bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 hover:brightness-110",
                            "border-b-4 border-yellow-800 active:border-b-0 active:translate-y-1",
                            "text-yellow-950 shadow-yellow-500/20"
                        )}
                    >
                        {spinning ? (
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                >
                                    ↻
                                </motion.div>
                            </div>
                        ) : "SPIN"}
                    </Button>
                </div>
            </footer>
        </div>
    )
}
