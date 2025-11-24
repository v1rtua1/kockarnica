"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" // Need to make sure this exists or use Input
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Upload, Save, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function ProfileSettingsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

    // Form States
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [bio, setBio] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Password States
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (status === "authenticated") {
            fetch("/api/user/profile")
                .then(res => res.json())
                .then(data => {
                    setUsername(data.username || "")
                    setEmail(data.email || "")
                    setBio(data.bio || "")
                    setPhoneNumber(data.phoneNumber || "")
                    setImagePreview(data.image)
                    setLoading(false)
                })
        }
    }, [status, router])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/user/image", {
                method: "POST",
                body: formData
            })
            if (!res.ok) throw new Error("Upload failed")
            // Success
        } catch (error) {
            console.error(error)
            setMessage({ type: "error", text: "Failed to upload image" })
        }
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, bio, phoneNumber })
            })

            if (res.ok) {
                setMessage({ type: "success", text: "Profile updated successfully" })
            } else {
                const data = await res.json()
                setMessage({ type: "error", text: data.error || "Failed to update profile" })
            }
        } catch (error) {
            setMessage({ type: "error", text: "Something went wrong" })
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch("/api/user/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword })
            })

            if (res.ok) {
                setMessage({ type: "success", text: "Password changed successfully" })
                setCurrentPassword("")
                setNewPassword("")
            } else {
                const data = await res.json()
                setMessage({ type: "error", text: data.error || "Failed to change password" })
            }
        } catch (error) {
            setMessage({ type: "error", text: "Something went wrong" })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="flex items-center mb-8">
                    <Link href="/profile">
                        <Button variant="ghost" className="text-neutral-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Profile
                        </Button>
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Settings */}
                    <div className="md:col-span-2 space-y-8">
                        <Card className="bg-neutral-900/50 border-white/10 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white">General Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            <Avatar className="w-24 h-24 border-2 border-white/10 group-hover:border-blue-500 transition-colors">
                                                <AvatarImage src={imagePreview || ""} className="object-cover" />
                                                <AvatarFallback>{email[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">Profile Picture</h3>
                                            <p className="text-sm text-neutral-400">Click to upload a new image</p>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-400">Username</label>
                                            <Input
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="bg-neutral-950/50 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-400">Email</label>
                                            <Input
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-neutral-950/50 border-white/10 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-400">Phone Number</label>
                                            <Input
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="bg-neutral-950/50 border-white/10 text-white"
                                                placeholder="+1 234 567 890"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-400">Bio</label>
                                        <Input
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="bg-neutral-950/50 border-white/10 text-white"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Save Changes
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Security Settings */}
                    <div className="space-y-8">
                        <Card className="bg-neutral-900/50 border-white/10 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Security
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-400">Current Password</label>
                                        <Input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="bg-neutral-950/50 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-400">New Password</label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="bg-neutral-950/50 border-white/10 text-white"
                                        />
                                    </div>
                                    <Button type="submit" disabled={saving} variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white">
                                        Change Password
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-lg border ${message.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
