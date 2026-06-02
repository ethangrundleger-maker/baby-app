import type { CatalogService } from "@/lib/types";

export const CATALOG: CatalogService[] = [
  // Pants
  { id: "svc_hem_pants", name: "Hem pants", category: "alteration", default_price: 22, payout_rate: 11, standard_minutes: 25, description: "Adjust pant length, original or blind hem.", active: true },
  { id: "svc_hem_jeans", name: "Hem jeans (original hem)", category: "alteration", default_price: 28, payout_rate: 14, standard_minutes: 30, description: "Keep the original hem of jeans for an authentic finish.", active: true },
  { id: "svc_taper_pants", name: "Taper pants", category: "alteration", default_price: 38, payout_rate: 19, standard_minutes: 45, description: "Slim the leg from knee to ankle.", active: true },
  { id: "svc_waist_in_pants", name: "Take in pants waist", category: "alteration", default_price: 34, payout_rate: 17, standard_minutes: 40, description: "Reduce waistband for a closer fit.", active: true },
  { id: "svc_waist_out_pants", name: "Let out pants waist", category: "alteration", default_price: 36, payout_rate: 18, standard_minutes: 40, description: "Expand waistband (up to available seam allowance).", active: true },
  // Tops
  { id: "svc_shorten_sleeves_shirt", name: "Shorten shirt sleeves", category: "alteration", default_price: 24, payout_rate: 12, standard_minutes: 30, description: "Shirt sleeve length with cuff reattach.", active: true },
  { id: "svc_shorten_sleeves_jacket", name: "Shorten jacket sleeves", category: "alteration", default_price: 55, payout_rate: 28, standard_minutes: 70, description: "Jacket sleeves shortened from the shoulder.", active: true },
  { id: "svc_take_in_shirt", name: "Take in shirt body", category: "alteration", default_price: 32, payout_rate: 16, standard_minutes: 40, description: "Slim the torso of a shirt or blouse.", active: true },
  // Dresses
  { id: "svc_hem_dress", name: "Hem dress / skirt", category: "alteration", default_price: 36, payout_rate: 18, standard_minutes: 45, description: "Adjust dress or skirt length.", active: true },
  { id: "svc_take_in_dress", name: "Take in dress bodice", category: "alteration", default_price: 48, payout_rate: 24, standard_minutes: 60, description: "Bodice and waist of a dress.", active: true },
  { id: "svc_strap_adjust", name: "Adjust dress straps", category: "alteration", default_price: 22, payout_rate: 11, standard_minutes: 25, description: "Shorten or move straps for fit.", active: true },
  // Outerwear
  { id: "svc_jacket_take_in", name: "Take in jacket / blazer", category: "alteration", default_price: 65, payout_rate: 32, standard_minutes: 80, description: "Tailor the body of a jacket or blazer.", active: true },
  { id: "svc_coat_hem", name: "Hem coat", category: "alteration", default_price: 58, payout_rate: 29, standard_minutes: 70, description: "Shorten a coat.", active: true },
  // Repairs
  { id: "svc_zipper_replace", name: "Replace zipper", category: "repair", default_price: 32, payout_rate: 16, standard_minutes: 40, description: "Full zipper replacement.", active: true },
  { id: "svc_button_repair", name: "Replace buttons", category: "repair", default_price: 8, payout_rate: 4, standard_minutes: 10, description: "Per button or fastener.", active: true },
  { id: "svc_seam_repair", name: "Seam repair", category: "repair", default_price: 14, payout_rate: 7, standard_minutes: 15, description: "Restitch a broken or split seam.", active: true },
  { id: "svc_patch", name: "Patch / mend", category: "repair", default_price: 22, payout_rate: 11, standard_minutes: 25, description: "Patch a tear, hole, or worn area.", active: true },
  { id: "svc_lining_repair", name: "Lining repair", category: "repair", default_price: 28, payout_rate: 14, standard_minutes: 35, description: "Restitch or partially replace a lining.", active: true },
];

export function getService(id: string) {
  return CATALOG.find((s) => s.id === id);
}
