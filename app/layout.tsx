import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Re:Fit — Mobile Tailoring & Alterations That Come to You",
    template: "%s · Re:Fit",
  },
  description:
    "Concierge tailoring on demand. A stylist pins your garments at home — vetted tailors do the work — we return them, ready to wear.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Re:Fit — The tailor comes to you",
    description: "Mobile tailoring & alterations. Book a pinning visit or self-pin.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
