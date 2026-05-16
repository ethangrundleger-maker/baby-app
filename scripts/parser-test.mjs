#!/usr/bin/env node
/**
 * Real parser regression: runs the heuristic parser against each of the
 * 4 sample reports and asserts structural invariants.
 */
// Run with: node --import tsx scripts/parser-test.mjs
const { parseHeuristic } = await import("../lib/parser/heuristic.ts");

const SAMPLES = [
  {
    name: "5/15",
    date: new Date("2026-05-15T12:00:00"),
    text: `5/15
(6:30/5oz & nursed)
8:07 wet
8:17 down; 9:03 up
9:16 6.5 oz breastmilk
10:15 wet
10:40 Dr appointment w/mom
11:51 5.5 oz formula
12:12 wet
12:21 walk/blessing box/park
1:10 down; 1:56 up
2:37 wet
2:45 6 oz formula
3:06 down
Development skills worked on: tummy time, rolling from tummy to back
Songs/music: let's go swimming; wheels on the bus
Books: brown bear; if animals kissed goodnight
Sensory: filled blessing box
Signs: sleep, walk, sun`,
    expect: { naps: 3, feeds: 3, diapers: 4, outings: 2, sections: 5 },
  },
  {
    name: "5/14",
    date: new Date("2026-05-14T12:00:00"),
    text: `5/14
(6:40/7)
8:20 dry
8:27 down ; 9:19 woke on his belly 2x; contact nap and up at 9:52
10:06 6 oz breastmilk
10:16 wet
11:35 down; 12:40 up
1:04 3 oz breast milk & 3 oz formula
1:15 wet/bm
2:18 wet/bm
2:45 down; 3:19 up
4:00 5 oz formula
4:15 wet
4:56 down
Development skills worked on: tummy time, rolling from tummy to back
Songs/music: toddler tunes
Books: abc animals
Sensory: grocery shopping for blessing box
Signs: walk, eat, love`,
    expect: { naps: 4, feeds: 3, diapers: 5, sections: 5 },
  },
];

let failures = 0;
for (const s of SAMPLES) {
  const { parsed, unparsedLines } = parseHeuristic(s.text, s.date);
  const counts = {
    naps: parsed.events.filter(e => e.type === "nap").length,
    feeds: parsed.events.filter(e => e.type === "feed").length,
    diapers: parsed.events.filter(e => e.type === "diaper").length,
    outings: parsed.events.filter(e => e.type === "outing").length,
    sections: parsed.events.filter(e => ["milestone","song","book","sensory","sign"].includes(e.type)).length,
  };
  console.log(`\n[${s.name}] confidence=${parsed.confidence.toFixed(2)} events=${parsed.events.length} unparsed=${unparsedLines.length}`);
  for (const [k, expected] of Object.entries(s.expect)) {
    const actual = counts[k];
    const pass = actual >= expected;
    if (!pass) failures++;
    console.log(`  ${pass ? "✓" : "✗"} ${k}: expected >= ${expected}, got ${actual}`);
  }
  // Monotonicity
  const times = parsed.events.filter(e => "start_time" in e || "time" in e)
    .map(e => new Date(("start_time" in e ? e.start_time : e.time) ?? 0).getTime())
    .filter(Boolean);
  const monotonic = times.every((t, i) => i === 0 || t >= times[i - 1]);
  console.log(`  ${monotonic ? "✓" : "✗"} timestamps monotonic`);
  if (!monotonic) failures++;
}
console.log(`\n${failures === 0 ? "✓ ALL PASSED" : `✗ ${failures} failures`}\n`);
process.exit(failures === 0 ? 0 : 1);
