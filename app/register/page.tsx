"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { motion } from "framer-motion"
import { Lock, Mail, User, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, username }), // Sending username even if backend doesn't use it yet
            })

            if (res.ok) {
                router.push("/login")
            } else {
                const data = await res.json()
                setError(data.error || "Registration failed")
                setLoading(false)
            }
        } catch (err) {
            setError("Something went wrong")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Back to Home Button */}
            <Link href="/" className="absolute top-8 left-8 z-10">
                <Button variant="ghost" className="text-white hover:bg-white/10 gap-2 pl-2 pr-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Button>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                    {/* Neon Border Effect */}
                    <div className="absolute inset-0 border border-transparent group-hover:border-blue-500/30 rounded-2xl transition-colors duration-500 pointer-events-none" />

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create Account</h1>
                        <p className="text-neutral-400 text-sm">Join the future of gaming today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative group/input">
                                <User className="absolute left-3 top-3 w-5 h-5 text-neutral-500 group-focus-within/input:text-blue-400 transition-colors" />
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 bg-neutral-950/50 border-neutral-800 text-white focus:border-blue-500/50 focus:ring-blue-500/20 h-11 transition-all"
                                    placeholder="johndoe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-neutral-500 group-focus-within/input:text-blue-400 transition-colors" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-neutral-950/50 border-neutral-800 text-white focus:border-blue-500/50 focus:ring-blue-500/20 h-11 transition-all"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-neutral-500 group-focus-within/input:text-blue-400 transition-colors" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-neutral-950/50 border-neutral-800 text-white focus:border-blue-500/50 focus:ring-blue-500/20 h-11 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 flex items-center gap-2"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium tracking-wide shadow-lg shadow-blue-500/20 transition-all duration-300"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                        </Button>

                        <div className="text-center mt-6">
                            <p className="text-neutral-500 text-sm">
                                Already have an account?{" "}
                                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors inline-flex items-center gap-1">
                                    Sign in <ArrowRight className="w-3 h-3" />
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
