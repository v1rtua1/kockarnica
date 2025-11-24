"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import GameLayout from "@/components/GameLayout"
import { useSession } from "next-auth/react"

type SlotProps = {
    gameName: string
    symbols: string[]
    paytable: Record<string, number>
    backgroundImage?: string
}

export default function SlotMachine({ gameName, symbols, paytable, backgroundImage }: SlotProps) {
    const { update } = useSession()
    const [reels, setReels] = useState<string[][]>([
        [symbols[0], symbols[1], symbols[2]],
        [symbols[1], symbols[2], symbols[0]],
        [symbols[2], symbols[0], symbols[1]],
        [symbols[0], symbols[1], symbols[2]],
        [symbols[1], symbols[2], symbols[0]],
    ])
    const [spinning, setSpinning] = useState(false)
    const [win, setWin] = useState(0)
    const [bet, setBet] = useState(10)

    const processTransaction = async (action: "BET" | "WIN", amount: number) => {
        try {
            const res = await fetch("/api/game/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, amount, game: gameName.toUpperCase().replace(/\s/g, "_") })
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

    const spin = async () => {
        if (spinning) return

        const success = await processTransaction("BET", bet)
        if (!success) {
            alert("Insufficient funds or error!")
            return
        }

        setSpinning(true)
        setWin(0)

        const duration = 2000
        const interval = setInterval(() => {
            setReels(prev => prev.map(() => [
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ]))
        }, 100)

        setTimeout(() => {
            clearInterval(interval)
            const finalReels = Array(5).fill(0).map(() => [
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ])
            setReels(finalReels)
            setSpinning(false)
            checkWin(finalReels)
        }, duration)
    }

    const checkWin = async (currentReels: string[][]) => {
        // Simple check: 3 or more same symbols in middle row
        const middleRow = currentReels.map(reel => reel[1])
        let currentSymbol = middleRow[0]
        let count = 1

        for (let i = 1; i < middleRow.length; i++) {
            if (middleRow[i] === currentSymbol) {
                count++
            } else {
                break
            }
        }

        if (count >= 3 && paytable[currentSymbol]) {
            const payout = paytable[currentSymbol] * count
            setWin(payout)
            await processTransaction("WIN", payout)
        }
    }

    return (
        <GameLayout title={gameName} currentBet={bet} lastWin={win}>
            <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
                <div className="bg-slate-900/90 p-4 md:p-8 rounded-xl border-4 border-yellow-600 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    {/* Decorative lights */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between px-4">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse delay-75" />
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse delay-150" />
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-300" />
                    </div>

                    <div className="flex gap-2 md:gap-4 mb-8 mt-4 bg-black p-4 md:p-6 rounded-lg border-4 border-slate-700 shadow-inner overflow-x-auto">
                        {reels.map((reel, i) => (
                            <div key={i} className="flex flex-col gap-2 md:gap-4 min-w-[60px] md:min-w-[80px]">
                                {reel.map((symbol, j) => (
                                    <div
                                        key={j}
                                        className={cn(
                                            "w-full aspect-square bg-gradient-to-b from-slate-100 to-slate-300 flex items-center justify-center text-3xl md:text-5xl rounded border-2 border-slate-400 shadow-sm transition-transform",
                                            spinning && "blur-[2px] scale-95"
                                        )}
                                    >
                                        <span className="drop-shadow-md filter">{symbol}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800 p-4 rounded-lg border-t-2 border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-slate-400">LINES <span className="text-white font-bold block text-lg">5</span></div>
                            <div className="text-sm text-slate-400">BET/LINE <span className="text-white font-bold block text-lg">$2</span></div>
                        </div>

                        <Button
                            onClick={spin}
                            disabled={spinning}
                            size="lg"
                            className="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-black text-xl px-12 py-8 h-auto shadow-[0_0_20px_rgba(234,179,8,0.5)] border-b-4 border-yellow-800 active:border-b-0 active:translate-y-1 transition-all"
                        >
                            {spinning ? "SPINNING..." : "SPIN"}
                        </Button>

                        <div className="flex items-center gap-4 text-right">
                            <div className="text-sm text-slate-400">TOTAL BET <span className="text-white font-bold block text-lg">${bet}</span></div>
                        </div>
                    </div>
                </div>

                {win > 0 && (
                    <div className="mt-8 text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] animate-bounce">
                        BIG WIN!
                    </div>
                )}
            </div>
        </GameLayout>
    )
}
