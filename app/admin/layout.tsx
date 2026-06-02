import { AdminShell } from "@/components/admin/shell";

export const metadata = { title: "Admin · Re:Fit", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
