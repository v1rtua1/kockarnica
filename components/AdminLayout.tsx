"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, ArrowLeftRight, LogOut, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/users", label: "Players", icon: Users },
        { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
                        Admin Panel
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}>
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white">
                            <Home className="w-4 h-4 mr-2" />
                            Back to Site
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => signOut({ callbackUrl: '/login' })}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-950">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
