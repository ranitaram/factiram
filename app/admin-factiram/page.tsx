import { isAdmin } from "@/lib/factiram-session";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel";

export default async function AdminFactiramPage() {
  const ok = await isAdmin();
  if (!ok) return <AdminLogin />;
  return <AdminPanel />;
}
