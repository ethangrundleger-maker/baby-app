"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getMyChildren } from "@/lib/auth";

const COOKIE = "selected_child_id";
// 180 days — matches the "stay signed in" expectation.
const MAX_AGE = 60 * 60 * 24 * 180;

export async function selectChild(childId: string): Promise<{ ok: boolean; error?: string }> {
  const children = await getMyChildren();
  if (!children.find((c) => c.id === childId)) {
    return { ok: false, error: "not_authorized" };
  }
  const store = await cookies();
  store.set(COOKIE, childId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
