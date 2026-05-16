"use client";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button onClick={async () => {
      await supabaseBrowser().auth.signOut();
      router.push("/login");
    }} className="rounded-lg bg-surface2 px-4 py-2 text-sm">
      Sign out
    </button>
  );
}
