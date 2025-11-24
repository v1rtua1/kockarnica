"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

interface Transaction {
    id: string
    amount: number
    type: string
    status: string
    createdAt: string
    user: {
        email: string
    }
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/admin/transactions")
            .then(res => res.json())
            .then(data => {
                setTransactions(data)
                setLoading(false)
            })
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Transaction History</h2>
                <button
                    onClick={async () => {
                        if (confirm("Are you sure you want to delete ALL transaction history? This cannot be undone.")) {
                            setLoading(true)
                            await fetch("/api/admin/transactions", { method: "DELETE" })
                            setTransactions([])
                            setLoading(false)
                        }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Clear History
                </button>
            </div>

            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-900">
                            <TableHead className="text-slate-400">Type</TableHead>
                            <TableHead className="text-slate-400">User</TableHead>
                            <TableHead className="text-slate-400">Amount</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-slate-400">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading...</TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">No transactions found</TableCell>
                            </TableRow>
                        ) : transactions.map((tx) => (
                            <TableRow key={tx.id} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {tx.type === "DEPOSIT" ? (
                                            <div className="p-1 rounded bg-green-500/10 text-green-400">
                                                <ArrowDownLeft className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="p-1 rounded bg-red-500/10 text-red-400">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </div>
                                        )}
                                        <span className="font-medium text-white">{tx.type}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-300">{tx.user.email}</TableCell>
                                <TableCell className={
                                    tx.type === "DEPOSIT" || tx.type === "GAME_WIN"
                                        ? "text-green-400"
                                        : "text-red-400"
                                }>
                                    ${tx.amount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        {tx.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-slate-500">
                                    {new Date(tx.createdAt).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
