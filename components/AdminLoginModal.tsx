"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { X, Lock, User, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AdminLoginModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (res?.error) {
                setError("Invalid credentials")
                setLoading(false)
            } else {
                router.push("/admin")
                // Keep modal open briefly or close it? 
                // Let's close it after a short delay or let the redirect handle it.
                // But since redirect happens client side, we should probably just wait.
            }
        } catch (err) {
            setError("Something went wrong")
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-slate-950 border border-yellow-500/30 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.1)] overflow-hidden relative"
                        >
                            {/* Neon Glow Effects */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                                        <Lock className="w-8 h-8 text-yellow-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white tracking-wide">ADMIN ACCESS</h2>
                                    <p className="text-slate-400 text-sm mt-2">Restricted Area. Authorized Personnel Only.</p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <User className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-yellow-500 transition-colors" />
                                            <Input
                                                type="email"
                                                placeholder="Admin Email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 bg-slate-900/50 border-slate-800 text-white focus:border-yellow-500/50 focus:ring-yellow-500/20 h-12 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-yellow-500 transition-colors" />
                                            <Input
                                                type="password"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 bg-slate-900/50 border-slate-800 text-white focus:border-yellow-500/50 focus:ring-yellow-500/20 h-12 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </motion.div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all duration-300"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "AUTHENTICATE"
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
