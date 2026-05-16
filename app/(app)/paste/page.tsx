import PasteForm from "./PasteForm";
import { getCurrentChild, getCurrentFamily } from "@/lib/auth";
import { fmtDateISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PastePage() {
  const fam = await getCurrentFamily();
  const child = await getCurrentChild();
  if (!fam || !child) {
    return <div className="py-8 text-muted">Set up your family in Settings first.</div>;
  }
  const tz = fam.family.timezone;
  const today = fmtDateISO(new Date(), tz);
  const role = fam.role as "parent" | "nanny" | "viewer";

  return (
    <div className="pt-2 pb-32 space-y-4">
      <h2 className="text-2xl font-semibold">Paste a report</h2>
      <p className="text-muted text-sm">Paste Shelly's end-of-day notes (or your own). The app will parse times, naps, feeds, diapers, outings, and the development sections.</p>
      <PasteForm childId={child.id} todayISO={today} defaultSource={role === "nanny" ? "nanny_paste" : "parent_paste"} />
    </div>
  );
}
