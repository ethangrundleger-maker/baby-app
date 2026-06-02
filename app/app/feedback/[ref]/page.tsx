"use client";

import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const compliments = ["On time", "Kind", "Expert", "Communicated well", "Took extra care"];
const issues = ["Late", "Hard to schedule", "Result not as expected", "Missed an adjustment", "Damaged a garment"];

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const positive = rating >= 4;
  const tagList = positive ? compliments : issues;

  function toggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  return (
    <PageContainer className="max-w-xl">
      <PageHeader title="How'd it go?" subtitle="Help us match you with the right tailor next time." />
      <Card className="mt-6">
        <CardBody>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} className="p-1">
                <Star className={cn("h-9 w-9", n <= rating ? "fill-brand-400 text-brand-400" : "text-line-strong")} />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <>
              <div className="mt-6">
                <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">{positive ? "What was great?" : "What went wrong?"}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tagList.map((t) => (
                    <button key={t} onClick={() => toggleTag(t)} className={cn("rounded-full border px-3 py-1 text-sm", tags.includes(t) ? "border-brand-500 bg-brand-50 text-brand-800" : "border-line bg-bg-card text-ink-soft hover:border-line-strong")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-muted">Anything else? (optional)</label>
                <Textarea rows={4} placeholder="Tell us more…" />
              </div>
              <Button variant="brand" size="lg" className="mt-5 w-full">Submit</Button>
            </>
          )}
        </CardBody>
      </Card>
    </PageContainer>
  );
}
