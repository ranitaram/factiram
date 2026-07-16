import { Metadata } from "next";
import { isAdmin } from "@/lib/factiram-session";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminFactiramPage() {
  const ok = await isAdmin();
  if (!ok) return <AdminLogin />;
  return <AdminPanel />;
}
