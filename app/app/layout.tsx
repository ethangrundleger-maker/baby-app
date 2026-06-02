import { AppShell } from "@/components/app/shell";

export const metadata = { title: "Re:Fit", robots: { index: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
