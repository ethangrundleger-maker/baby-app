import { AdminPage, AdminPageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FEEDBACK } from "@/lib/mock/seed";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";

export default function FeedbackPage() {
  return (
    <AdminPage>
      <AdminPageHeader title="Feedback" subtitle="Every rating across pinner and tailor work, with tags." />
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-bg-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-2.5 font-medium">Subject</th>
              <th className="px-5 py-2.5 font-medium">Rating</th>
              <th className="px-5 py-2.5 font-medium">Sentiment</th>
              <th className="px-5 py-2.5 font-medium">Tags</th>
              <th className="px-5 py-2.5 font-medium">Comment</th>
              <th className="px-5 py-2.5 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {FEEDBACK.map((f) => (
              <tr key={f.id} className="border-t border-line align-top">
                <td className="px-5 py-3 capitalize">{f.subject_type}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-3.5 w-3.5 ${n <= f.rating ? "fill-brand-400 text-brand-400" : "text-line-strong"}`} />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3"><Badge tone={f.sentiment === "positive" ? "success" : "warn"}>{f.sentiment}</Badge></td>
                <td className="px-5 py-3 text-xs text-ink-muted">{f.tags.join(", ")}</td>
                <td className="px-5 py-3 text-ink-muted max-w-md">{f.comment}</td>
                <td className="px-5 py-3 text-xs text-ink-muted">{formatDate(f.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminPage>
  );
}
