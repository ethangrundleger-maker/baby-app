import type { Staff } from "@/lib/types";

export const STAFF: Staff[] = [
  { id: "stf_admin_1", hub_id: "hub_nyc", name: "Avery Chen", role: "admin", is_contractor: false, efficiency_rating: 1.0, active: true },
  { id: "stf_pinner_1", hub_id: "hub_nyc", name: "Maya Patel", role: "pinner", is_contractor: true, efficiency_rating: 1.15, active: true },
  { id: "stf_pinner_2", hub_id: "hub_nyc", name: "Sofia Rivera", role: "pinner", is_contractor: true, efficiency_rating: 1.05, active: true },
  { id: "stf_pinner_3", hub_id: "hub_sf", name: "Jordan Park", role: "pinner", is_contractor: true, efficiency_rating: 0.95, active: true },
  {
    id: "stf_tailor_1",
    hub_id: "hub_nyc",
    name: "Elena Vasquez",
    role: "tailor",
    is_contractor: true,
    efficiency_rating: 1.25,
    payout_cadence: "weekly",
    capabilities: ["svc_hem_pants", "svc_hem_jeans", "svc_taper_pants", "svc_waist_in_pants", "svc_take_in_shirt", "svc_zipper_replace", "svc_button_repair", "svc_seam_repair"],
    active: true,
  },
  {
    id: "stf_tailor_2",
    hub_id: "hub_nyc",
    name: "Hiroshi Tanaka",
    role: "tailor",
    is_contractor: true,
    efficiency_rating: 1.4,
    payout_cadence: "biweekly",
    capabilities: ["svc_jacket_take_in", "svc_coat_hem", "svc_shorten_sleeves_jacket", "svc_take_in_dress", "svc_hem_dress", "svc_lining_repair"],
    active: true,
  },
  {
    id: "stf_tailor_3",
    hub_id: "hub_sf",
    name: "Priya Singh",
    role: "tailor",
    is_contractor: true,
    efficiency_rating: 1.1,
    payout_cadence: "weekly",
    capabilities: ["svc_hem_pants", "svc_hem_dress", "svc_take_in_dress", "svc_strap_adjust", "svc_button_repair", "svc_seam_repair", "svc_patch"],
    active: true,
  },
  {
    id: "stf_tailor_4",
    hub_id: "hub_nyc",
    name: "Marcus King",
    role: "tailor",
    is_contractor: true,
    efficiency_rating: 0.95,
    payout_cadence: "weekly",
    capabilities: ["svc_hem_pants", "svc_hem_jeans", "svc_seam_repair", "svc_button_repair", "svc_patch"],
    active: true,
  },
  { id: "stf_driver_1", hub_id: "hub_nyc", name: "Dani Vega", role: "driver", is_contractor: true, efficiency_rating: 1.0, active: true },
];

export function getStaff(id: string) {
  return STAFF.find((s) => s.id === id);
}
