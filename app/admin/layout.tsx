import AdminLayout from "@/components/AdminLayout"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Admin Panel | Casino Royale",
    description: "Casino Royale Administration",
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <AdminLayout>{children}</AdminLayout>
}
