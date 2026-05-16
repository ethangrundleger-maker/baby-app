import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Root() {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/login");
  redirect("/today");
}
