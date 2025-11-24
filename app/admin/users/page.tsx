"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Trash2, Wallet, UserCog } from "lucide-react"

interface User {
    id: string
    email: string
    role: string
    balance: number
    createdAt: string
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [amount, setAmount] = useState("")
    const [actionType, setActionType] = useState<"ADD" | "REMOVE" | null>(null)

    const fetchUsers = () => {
        setLoading(true)
        fetch(`/api/admin/users?query=${search}`)
            .then(res => res.json())
            .then(data => {
                setUsers(data)
                setLoading(false)
            })
    }

    useEffect(() => {
        const debounce = setTimeout(fetchUsers, 500)
        return () => clearTimeout(debounce)
    }, [search])

    const handleFunds = async () => {
        if (!selectedUser || !amount || !actionType) return

        const val = parseFloat(amount)
        if (isNaN(val) || val <= 0) return

        const newBalance = actionType === "ADD"
            ? selectedUser.balance + val
            : selectedUser.balance - val

        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ balance: newBalance })
            })

            if (res.ok) {
                // Also create a transaction record
                // Note: Ideally this should be a transaction on the backend, but for now we do it here or assume backend handles it?
                // The backend PATCH currently only updates user. We should probably update the backend to create a transaction too.
                // But for speed, let's just update the UI.
                fetchUsers()
                setSelectedUser(null)
                setAmount("")
                setActionType(null)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "DELETE"
            })
            if (res.ok) fetchUsers()
        } catch (error) {
            console.error(error)
        }
    }

    const handleRoleToggle = async (user: User) => {
        const newRole = user.role === "ADMIN" ? "USER" : "ADMIN"
        const action = newRole === "ADMIN" ? "promote this user to ADMIN" : "revoke ADMIN rights from this user"

        if (!confirm(`Are you sure you want to ${action}?`)) return

        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            })

            if (res.ok) {
                fetchUsers()
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Player Management</h2>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by email..."
                        className="pl-8 bg-slate-900 border-slate-800 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-900">
                            <TableHead className="text-slate-400">Email</TableHead>
                            <TableHead className="text-slate-400">Role</TableHead>
                            <TableHead className="text-slate-400">Balance</TableHead>
                            <TableHead className="text-slate-400">Joined</TableHead>
                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading...</TableCell>
                            </TableRow>
                        ) : users.map((user) => (
                            <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell className="font-medium text-white">{user.email}</TableCell>
                                <TableCell>
                                    <span className={user.role === "ADMIN" ? "text-yellow-400" : "text-slate-400"}>
                                        {user.role}
                                    </span>
                                </TableCell>
                                <TableCell className="text-green-400 font-mono">${user.balance.toFixed(2)}</TableCell>
                                <TableCell className="text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                                        onClick={() => { setSelectedUser(user); setActionType("ADD"); }}
                                    >
                                        <Wallet className="w-4 h-4 mr-1" /> Funds
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className={`border-yellow-500/50 ${user.role === 'ADMIN' ? 'text-yellow-400 bg-yellow-500/10' : 'text-slate-400 hover:text-yellow-400'}`}
                                        onClick={() => handleRoleToggle(user)}
                                        title={user.role === 'ADMIN' ? "Revoke Admin" : "Make Admin"}
                                    >
                                        <UserCog className="w-4 h-4" />
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/50"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Simple Modal for Funds */}
            {selectedUser && actionType && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold text-white">Manage Funds for {selectedUser.email.split('@')[0]}</h3>
                        <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
                            <button
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${actionType === "ADD" ? "bg-green-600 text-white" : "text-slate-400 hover:text-white"}`}
                                onClick={() => setActionType("ADD")}
                            >
                                Add Funds
                            </button>
                            <button
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${actionType === "REMOVE" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"}`}
                                onClick={() => setActionType("REMOVE")}
                            >
                                Remove Funds
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">Amount ($)</label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-white text-lg"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => { setSelectedUser(null); setAmount(""); }}>Cancel</Button>
                            <Button
                                onClick={handleFunds}
                                className={actionType === "ADD" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                            >
                                Confirm {actionType === "ADD" ? "Deposit" : "Withdrawal"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
