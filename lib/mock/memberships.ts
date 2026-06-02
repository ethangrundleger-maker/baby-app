import type { MembershipPlan } from "@/lib/types";

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "plan_essentials",
    name: "Essentials",
    billing_cycle: "monthly",
    price: 19,
    discount_pct: 10,
    benefits: [
      "10% off every alteration & repair",
      "Free pickup & return on every order",
      "Priority pinning slots within 48h",
      "One free button-replace credit / month",
    ],
  },
  {
    id: "plan_signature",
    name: "Signature",
    billing_cycle: "monthly",
    price: 39,
    discount_pct: 20,
    benefits: [
      "20% off every alteration & repair",
      "Free pickup & return, same-week priority",
      "Two free hem credits / month",
      "Dedicated stylist concierge",
      "Quarterly wardrobe audit (in-home)",
    ],
  },
  {
    id: "plan_signature_annual",
    name: "Signature (annual)",
    billing_cycle: "annual",
    price: 390,
    discount_pct: 25,
    benefits: [
      "Everything in Signature, 25% off",
      "Two months free vs. monthly",
      "VIP scheduling — first pick of slots",
      "Annual fit assessment with a senior tailor",
    ],
  },
];
