"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import GameLayout from "@/components/GameLayout"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"

export default function KenoPage() {
    const { update } = useSession()
    const [betInput, setBetInput] = useState("10")
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
    const [drawnNumbers, setDrawnNumbers] = useState<number[]>([])
    const [gameState, setGameState] = useState<"picking" | "playing" | "finished">("picking")
    const [lastWin, setLastWin] = useState(0)

    const bet = parseFloat(betInput) || 0

    const toggleNumber = (num: number) => {
        if (gameState !== "picking") return
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(prev => prev.filter(n => n !== num))
        } else {
            if (selectedNumbers.length < 10) {
                setSelectedNumbers(prev => [...prev, num])
            }
        }
    }

    const play = async () => {
        if (selectedNumbers.length === 0 || bet <= 0) return
        setGameState("playing")
        setDrawnNumbers([])
        setLastWin(0)

        try {
            const res = await fetch("/api/game/play", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gameId: "keno",
                    bet,
                    params: { selectedNumbers }
                })
            })

            if (!res.ok) throw new Error("Game failed")
            const data = await res.json()

            // Reveal numbers one by one
            const serverDrawn = data.result.drawnNumbers
            let i = 0
            const interval = setInterval(() => {
                if (i >= serverDrawn.length) {
                    clearInterval(interval)
                    setGameState("finished")
                    setLastWin(data.payout)
                    update({ balance: data.balance })
                    return
                }
                setDrawnNumbers(prev => [...prev, serverDrawn[i]])
                i++
            }, 100) // Fast reveal

        } catch (error) {
            console.error(error)
            setGameState("picking")
        }
    }

    return (
        <GameLayout title="Keno" currentBet={bet} lastWin={lastWin}>
            <div className="flex flex-col items-center w-full max-w-6xl mx-auto">

                {/* Header Info */}
                <div className="mb-8 text-center flex flex-col md:flex-row justify-between w-full items-center bg-slate-900/50 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
                    <div className="text-left mb-4 md:mb-0">
                        <h2 className="text-2xl font-bold text-white mb-1">Pick Your Numbers</h2>
                        <p className="text-slate-400">Select up to 10 numbers. Match more to win big!</p>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-center">
                            <div className="text-sm text-slate-500 uppercase font-bold">Selected</div>
                            <div className={cn("text-3xl font-bold", selectedNumbers.length === 10 ? "text-red-500" : "text-yellow-400")}>
                                {selectedNumbers.length}/10
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-slate-500 uppercase font-bold">Matches</div>
                            <div className="text-3xl font-bold text-green-400">
                                {selectedNumbers.filter(n => drawnNumbers.includes(n)).length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Keno Grid */}
                <div className="grid grid-cols-10 gap-1 md:gap-2 mb-8 w-full bg-black/40 p-4 md:p-8 rounded-2xl border border-white/5 shadow-inner">
                    {Array.from({ length: 80 }, (_, i) => i + 1).map(num => {
                        const isSelected = selectedNumbers.includes(num)
                        const isDrawn = drawnNumbers.includes(num)
                        const isHit = isSelected && isDrawn

                        return (
                            <motion.button
                                key={num}
                                onClick={() => toggleNumber(num)}
                                disabled={gameState !== "picking"}
                                whileHover={gameState === "picking" ? { scale: 1.1 } : {}}
                                whileTap={gameState === "picking" ? { scale: 0.9 } : {}}
                                className={cn(
                                    "aspect-square rounded-lg font-bold text-sm md:text-xl transition-all relative flex items-center justify-center border",
                                    isHit ? "bg-green-500 text-white border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)] z-10" :
                                        isDrawn ? "bg-red-500/80 text-white border-red-500/50" :
                                            isSelected ? "bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]" :
                                                "bg-slate-800/50 border-white/5 text-slate-500 hover:bg-slate-700 hover:text-white hover:border-white/20"
                                )}
                            >
                                {num}
                                {isHit && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        className="absolute inset-0 bg-green-400 rounded-full"
                                    />
                                )}
                            </motion.button>
                        )
                    })}
                </div>

                {/* Controls */}
                <div className="w-full max-w-3xl bg-slate-900/90 p-6 rounded-xl border border-white/10 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-end justify-center">

                    {/* Bet Input */}
                    <div className="w-full md:w-auto flex-1">
                        <label className="text-sm text-slate-400 mb-2 block font-bold uppercase">Bet Amount</label>
                        <Input
                            type="number"
                            value={betInput}
                            onChange={(e) => setBetInput(e.target.value)}
                            disabled={gameState === "playing"}
                            className="bg-slate-950 border-slate-700 text-white text-xl h-14 text-center"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 w-full md:w-auto">
                        {gameState === "picking" ? (
                            <Button
                                onClick={play}
                                disabled={selectedNumbers.length === 0 || bet <= 0}
                                className="h-14 px-12 text-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black shadow-lg shadow-yellow-500/20 flex-1 md:flex-none"
                            >
                                PLAY
                            </Button>
                        ) : gameState === "finished" ? (
                            <Button
                                onClick={() => { setGameState("picking"); setSelectedNumbers([]); setDrawnNumbers([]); }}
                                className="h-14 px-12 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 flex-1 md:flex-none"
                            >
                                NEW GAME
                            </Button>
                        ) : (
                            <Button disabled className="h-14 px-12 text-xl font-bold bg-slate-700 text-slate-400 flex-1 md:flex-none">
                                DRAWING...
                            </Button>
                        )}

                        {gameState !== "playing" && (
                            <Button
                                variant="outline"
                                onClick={() => { setSelectedNumbers([]); setDrawnNumbers([]); }}
                                disabled={selectedNumbers.length === 0}
                                className="h-14 px-6 border-slate-700 hover:bg-slate-800 text-slate-400"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </GameLayout>
    )
}
