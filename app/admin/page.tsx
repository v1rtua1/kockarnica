"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wallet, Activity, TrendingUp } from "lucide-react"

interface Stats {
    totalUsers: number
    totalBalance: number
    activeUsers: number
    recentActivity: any[]
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/admin/stats")
            .then(res => res.json())
            .then(data => {
                setStats(data)
                setLoading(false)
            })
            .catch(err => console.error(err))
    }, [])

    if (loading) return <div className="text-white">Loading stats...</div>

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Players</CardTitle>
                        <Users className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.totalUsers}</div>
                        <p className="text-xs text-slate-500 mt-1">+2 from last week</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Balance</CardTitle>
                        <Wallet className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${stats?.totalBalance.toFixed(2)}</div>
                        <p className="text-xs text-slate-500 mt-1">Player funds held</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Users</CardTitle>
                        <Activity className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.activeUsers}</div>
                        <p className="text-xs text-slate-500 mt-1">In the last 24 hours</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Revenue</CardTitle>
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">$12,450.00</div>
                        <p className="text-xs text-slate-500 mt-1">Estimated monthly</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Simple Activity Chart */}
                <Card className="bg-slate-900 border-slate-800 col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white">User Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-end gap-4 p-4 border-b border-l border-slate-700">
                            {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                                <div key={i} className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 transition-colors rounded-t-sm relative group" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h} Users
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-sm text-slate-500">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity List */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Registrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentActivity.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                                            {user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{user.email.split('@')[0]}</div>
                                            <div className="text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400">
                                        New
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
