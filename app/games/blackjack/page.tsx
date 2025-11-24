"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import GameLayout from "@/components/GameLayout"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type CardType = {
    suit: "hearts" | "diamonds" | "clubs" | "spades"
    value: string
    numericValue: number
}

const SUIT_ICONS = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠"
}

const SUIT_COLORS = {
    hearts: "text-red-600",
    diamonds: "text-red-600",
    clubs: "text-slate-900",
    spades: "text-slate-900"
}

export default function BlackjackPage() {
    const { data: session, update } = useSession()
    const [playerHand, setPlayerHand] = useState<CardType[]>([])
    const [dealerHand, setDealerHand] = useState<CardType[]>([])
    const [gameState, setGameState] = useState<"betting" | "playing" | "dealerTurn" | "finished">("betting")
    const [message, setMessage] = useState("")
    const [betInput, setBetInput] = useState("10")
    const [lastWin, setLastWin] = useState(0)
    const [deck, setDeck] = useState<CardType[]>([])

    const bet = parseFloat(betInput) || 0

    const processTransaction = async (action: "BET" | "WIN", amount: number) => {
        try {
            const res = await fetch("/api/game/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, amount, game: "BLACKJACK" })
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

    const generateDeck = () => {
        const suits = ["hearts", "diamonds", "clubs", "spades"] as const
        const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
        const deck: CardType[] = []

        for (const suit of suits) {
            for (const value of values) {
                let numericValue = parseInt(value)
                if (["J", "Q", "K"].includes(value)) numericValue = 10
                if (value === "A") numericValue = 11
                deck.push({ suit, value, numericValue })
            }
        }
        return deck.sort(() => Math.random() - 0.5)
    }

    const calculateScore = (hand: CardType[]) => {
        let score = 0
        let aces = 0
        for (const card of hand) {
            score += card.numericValue
            if (card.value === "A") aces++
        }
        while (score > 21 && aces > 0) {
            score -= 10
            aces--
        }
        return score
    }

    const startGame = async () => {
        if (bet <= 0) return
        const success = await processTransaction("BET", bet)
        if (!success) {
            alert("Insufficient funds or error!")
            return
        }

        const newDeck = generateDeck()

        // RIGGED LOGIC: 80% chance to give Dealer a 20
        const forceLoss = Math.random() < 0.8
        let pHand: CardType[]
        let dHand: CardType[]

        if (forceLoss) {
            // Give dealer 20 (King + Queen)
            // We need to find them in the deck and remove them
            const kIndex = newDeck.findIndex(c => c.value === "K")
            const k = newDeck.splice(kIndex, 1)[0]
            const qIndex = newDeck.findIndex(c => c.value === "Q")
            const q = newDeck.splice(qIndex, 1)[0]

            dHand = [k, q]
            pHand = [newDeck.pop()!, newDeck.pop()!]
        } else {
            // Fair deal
            pHand = [newDeck.pop()!, newDeck.pop()!]
            dHand = [newDeck.pop()!, newDeck.pop()!]
        }

        setDeck(newDeck)
        setPlayerHand(pHand)
        setDealerHand(dHand)
        setGameState("playing")
        setMessage("")
        setLastWin(0)
    }

    const hit = () => {
        const newDeck = [...deck]
        const card = newDeck.pop()!
        const newHand = [...playerHand, card]
        setPlayerHand(newHand)
        setDeck(newDeck)

        if (calculateScore(newHand) > 21) {
            setGameState("finished")
            setMessage("Bust! You lost.")
        }
    }

    const stand = async () => {
        setGameState("dealerTurn")
        let dHand = [...dealerHand]
        let dDeck = [...deck]

        // Dealer hits on soft 17 logic usually, but here simple < 17
        while (calculateScore(dHand) < 17) {
            dHand.push(dDeck.pop()!)
        }

        setDealerHand(dHand)
        setDeck(dDeck)
        setGameState("finished")

        const pScore = calculateScore(playerHand)
        const dScore = calculateScore(dHand)

        if (dScore > 21 || pScore > dScore) {
            setMessage("You Win!")
            const winAmount = bet * 2
            setLastWin(winAmount)
            await processTransaction("WIN", winAmount)
        } else if (dScore === pScore) {
            setMessage("Push!")
            setLastWin(bet)
            await processTransaction("WIN", bet) // Return bet
        } else {
            setMessage("Dealer Wins!")
        }
    }

    const renderCard = (card: CardType, index: number, hidden: boolean = false) => {
        if (hidden) {
            return (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: -50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-24 h-36 bg-gradient-to-br from-red-700 to-red-900 rounded-xl border-2 border-white/20 shadow-xl flex items-center justify-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20" />
                    <div className="w-16 h-24 border-2 border-red-400/30 rounded-lg" />
                </motion.div>
            )
        }

        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: -50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-24 h-36 bg-white rounded-xl shadow-xl flex flex-col justify-between p-2 relative"
            >
                <div className={cn("text-lg font-bold leading-none", SUIT_COLORS[card.suit])}>
                    {card.value}
                    <div className="text-sm">{SUIT_ICONS[card.suit]}</div>
                </div>
                <div className={cn("text-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", SUIT_COLORS[card.suit])}>
                    {SUIT_ICONS[card.suit]}
                </div>
                <div className={cn("text-lg font-bold leading-none rotate-180", SUIT_COLORS[card.suit])}>
                    {card.value}
                    <div className="text-sm">{SUIT_ICONS[card.suit]}</div>
                </div>
            </motion.div>
        )
    }

    return (
        <GameLayout title="Blackjack" currentBet={bet} lastWin={lastWin}>
            <div className="flex flex-col items-center w-full max-w-5xl mx-auto">

                {/* Game Table */}
                <div className="w-full bg-[#0f380f] rounded-full border-[16px] border-[#2d1b0e] shadow-2xl p-8 md:p-16 relative min-h-[600px] flex flex-col justify-between mb-8 overflow-hidden">
                    {/* Felt Texture Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-50 pointer-events-none" />

                    {/* Dealer Area */}
                    <div className="flex flex-col items-center z-10">
                        <div className="text-white/50 font-bold uppercase tracking-widest text-sm mb-4">Dealer</div>
                        <div className="flex gap-4 -ml-12">
                            {dealerHand.map((card, i) => (
                                <div key={i} className="relative" style={{ left: `${i * 30}px` }}>
                                    {renderCard(card, i, gameState === "playing" && i === 0)}
                                </div>
                            ))}
                        </div>
                        {gameState !== "playing" && dealerHand.length > 0 && (
                            <div className="mt-4 bg-black/40 px-3 py-1 rounded-full text-white font-bold backdrop-blur-sm">
                                {calculateScore(dealerHand)}
                            </div>
                        )}
                    </div>

                    {/* Center Message */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="bg-black/80 text-white px-8 py-4 rounded-2xl border-2 border-yellow-500 shadow-2xl backdrop-blur-md"
                                >
                                    <h2 className="text-4xl font-bold text-yellow-400 whitespace-nowrap">{message}</h2>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Player Area */}
                    <div className="flex flex-col items-center z-10">
                        <div className="flex gap-4 -ml-12 mb-4">
                            {playerHand.map((card, i) => (
                                <div key={i} className="relative" style={{ left: `${i * 30}px` }}>
                                    {renderCard(card, i)}
                                </div>
                            ))}
                        </div>
                        {playerHand.length > 0 && (
                            <div className="bg-black/40 px-3 py-1 rounded-full text-white font-bold backdrop-blur-sm mb-2">
                                {calculateScore(playerHand)}
                            </div>
                        )}
                        <div className="text-white/50 font-bold uppercase tracking-widest text-sm">You</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full max-w-2xl bg-slate-900/90 p-6 rounded-xl border border-white/10 backdrop-blur-sm flex flex-col gap-6">
                    {gameState === "betting" ? (
                        <div className="flex gap-4 items-end justify-center">
                            <div className="w-full max-w-xs">
                                <label className="text-sm text-slate-400 mb-2 block font-bold uppercase">Bet Amount</label>
                                <Input
                                    type="number"
                                    value={betInput}
                                    onChange={(e) => setBetInput(e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-white text-xl h-14 text-center"
                                />
                            </div>
                            <Button
                                onClick={startGame}
                                disabled={bet <= 0}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl h-14 px-12 shadow-lg shadow-yellow-500/20"
                            >
                                DEAL
                            </Button>
                        </div>
                    ) : gameState === "playing" ? (
                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={hit}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl h-16 px-12 shadow-lg shadow-green-600/20"
                            >
                                HIT
                            </Button>
                            <Button
                                onClick={stand}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xl h-16 px-12 shadow-lg shadow-red-600/20"
                            >
                                STAND
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <Button
                                onClick={() => setGameState("betting")}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl h-14 px-12 shadow-lg shadow-blue-600/20"
                            >
                                PLAY AGAIN
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </GameLayout>
    )
}
