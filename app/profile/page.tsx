"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, FileText, Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface UserProfile {
    username: string | null
    email: string
    image: string | null
    bio: string | null
    phoneNumber: string | null
    role: string
    balance: number
    createdAt: string
}

interface Bet {
    id: string
    game: {
        name: string
    }
    amount: number
    payout: number
    result: string
    createdAt: string
}

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [bets, setBets] = useState<Bet[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (status === "authenticated") {
            Promise.all([
                fetch("/api/user/profile").then(res => res.json()),
                fetch("/api/user/bets").then(res => res.json())
            ]).then(([profileData, betsData]) => {
                setProfile(profileData)
                setBets(betsData)
                setLoading(false)
            })
        }
    }, [status, router])

    if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="flex items-center justify-between mb-8">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="text-neutral-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Link href="/profile/settings">
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    </Link>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {/* Profile Card */}
                    <Card className="md:col-span-1 bg-neutral-900/50 border-white/10 backdrop-blur-xl">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="relative mb-4 group">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity" />
                                <Avatar className="w-32 h-32 border-4 border-neutral-900 relative">
                                    <AvatarImage src={profile?.image || ""} className="object-cover" />
                                    <AvatarFallback className="bg-neutral-800 text-4xl font-bold text-neutral-400">
                                        {profile?.email[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">{profile?.username || "User"}</h2>
                            <p className="text-neutral-400 text-sm mb-4">{profile?.email}</p>
                            <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">
                                {profile?.role}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Card */}
                    <Card className="md:col-span-2 bg-neutral-900/50 border-white/10 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6">
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5">
                                    <User className="w-5 h-5 text-blue-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-400">Username</p>
                                        <p className="text-white">{profile?.username || "Not set"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5">
                                    <Mail className="w-5 h-5 text-purple-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-400">Email</p>
                                        <p className="text-white">{profile?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5">
                                    <Phone className="w-5 h-5 text-green-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-400">Phone</p>
                                        <p className="text-white">{profile?.phoneNumber || "Not set"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5">
                                    <FileText className="w-5 h-5 text-yellow-400 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-400">Bio</p>
                                        <p className="text-white">{profile?.bio || "No bio yet."}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bet History Card */}
                    <Card className="md:col-span-3 bg-neutral-900/50 border-white/10 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Game History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-neutral-400">
                                    <thead className="text-xs uppercase bg-white/5 text-neutral-300">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Game</th>
                                            <th className="px-4 py-3">Result</th>
                                            <th className="px-4 py-3">Bet</th>
                                            <th className="px-4 py-3">Payout</th>
                                            <th className="px-4 py-3 rounded-r-lg">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bets.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                                                    No games played yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            bets.map((bet) => (
                                                <tr key={bet.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-white">{bet.game.name}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${bet.result === "WIN"
                                                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                            }`}>
                                                            {bet.result}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-white">${bet.amount.toFixed(2)}</td>
                                                    <td className={`px-4 py-3 font-medium ${bet.payout > 0 ? "text-green-400" : "text-neutral-500"}`}>
                                                        ${bet.payout.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-neutral-500">
                                                        {new Date(bet.createdAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
