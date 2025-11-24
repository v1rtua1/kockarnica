"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Shield, Zap, Gamepad2, Lock } from "lucide-react"
import AdminLoginModal from "@/components/AdminLoginModal"

export default function Home() {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-yellow-500/30 overflow-hidden">
      <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />

      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <span className="text-xl font-bold text-black">CR</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Casino Royale</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-yellow-400 hover:bg-white/5">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold">
                Sign Up
              </Button>
            </Link>
            <Button
              className="bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm gap-2 transition-all"
              onClick={() => setIsAdminModalOpen(true)}
            >
              <Lock className="w-4 h-4" />
              Admin Panel
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col justify-center items-center text-center py-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8"
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-yellow-400 mb-4">
                Welcome to the Future of Gaming
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Experience the Thrill of <br />
                <span className="text-yellow-500">Premium Gambling</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
                Join the most exclusive online casino platform. Play your favorite slots, table games, and live dealers with instant payouts and top-tier security.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 border-0 text-lg px-8 py-6 h-auto shadow-lg shadow-yellow-500/25">
                  Start Playing Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" className="bg-white text-black hover:bg-neutral-200 text-lg px-8 py-6 h-auto font-bold shadow-lg shadow-white/10 transition-all">
                  View Games
                </Button>
              </Link>
            </motion.div>

            {/* Features Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20 text-left">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Premium Games</h3>
                <p className="text-neutral-400">Access hundreds of top-tier slots and table games from the world's best providers.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Secure & Fair</h3>
                <p className="text-neutral-400">Your security is our priority. We use state-of-the-art encryption and fair RNG.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Payouts</h3>
                <p className="text-neutral-400">Win big and get your money fast. Automated withdrawals processed 24/7.</p>
              </div>
            </motion.div>
          </motion.div>
        </main>

        <footer className="py-8 text-center text-neutral-500 text-sm">
          © {new Date().getFullYear()} Casino Royale. All rights reserved. Please gamble responsibly.
        </footer>
      </div>
    </div>
  )
}
