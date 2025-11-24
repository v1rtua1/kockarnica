"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { LogOut, User, Coins, Gamepad2, Dices, Spade, CircleDollarSign, Grid3X3, Gem } from "lucide-react"

const games = [
    { name: "Blackjack", href: "/games/blackjack", icon: Spade, color: "from-slate-700 to-slate-900" },
    { name: "Roulette", href: "/games/roulette", icon: CircleDollarSign, color: "from-red-600 to-red-800" },
    { name: "Keno", href: "/games/keno", icon: Grid3X3, color: "from-indigo-500 to-purple-700" },
    { name: "Classic Slots", href: "/games/classic-slots", icon: Gem, color: "from-yellow-400 to-yellow-600" },
]

export default function DashboardPage() {
    const { data: session } = useSession()

    return (
        <div className="min-h-screen bg-neutral-950 p-4 md:p-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden relative">
                            {session?.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-white">
                                    {session?.user?.username?.[0]?.toUpperCase() || session?.user?.email?.[0].toUpperCase() || "U"}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {session?.user?.username || session?.user?.email?.split('@')[0]}
                            </h1>
                            <div className="flex items-center gap-2 text-neutral-400 text-sm">
                                <Coins className="w-4 h-4 text-yellow-500" />
                                <span>Balance: <span className="text-white font-mono">${session?.user?.balance?.toFixed(2) || "0.00"}</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/profile">
                            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
                                <User className="w-4 h-4 mr-2" />
                                Profile
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            onClick={() => signOut()}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </header>

                {/* Games Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {games.map((game, index) => (
                        <Link href={game.href} key={index}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-colors"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                                    <game.icon className="w-12 h-12 mb-4 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                                    <h3 className="text-xl font-bold drop-shadow-md">{game.name}</h3>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
