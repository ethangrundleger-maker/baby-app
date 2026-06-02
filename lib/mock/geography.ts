import type { OperatingHub, ServiceArea } from "@/lib/types";

export const HUBS: OperatingHub[] = [
  { id: "hub_nyc", name: "New York", address: "Brooklyn, NY", active: true },
  { id: "hub_sf", name: "San Francisco Bay", address: "San Francisco, CA", active: true },
  { id: "hub_la", name: "Los Angeles", address: "Los Angeles, CA", active: true },
  { id: "hub_chi", name: "Chicago", address: "Chicago, IL", active: false },
];

export const SERVICE_AREAS: ServiceArea[] = [
  {
    id: "area_manhattan",
    hub_id: "hub_nyc",
    name: "Manhattan",
    zips: ["10001", "10002", "10003", "10010", "10011", "10012", "10013", "10014", "10016", "10017", "10018", "10019", "10021", "10022", "10023", "10024", "10025", "10028"],
  },
  {
    id: "area_brooklyn",
    hub_id: "hub_nyc",
    name: "Brooklyn",
    zips: ["11201", "11205", "11211", "11215", "11217", "11222", "11231", "11238"],
  },
  {
    id: "area_sf_proper",
    hub_id: "hub_sf",
    name: "San Francisco",
    zips: ["94102", "94103", "94107", "94110", "94114", "94115", "94117", "94118", "94121", "94122", "94123"],
  },
  {
    id: "area_oakland",
    hub_id: "hub_sf",
    name: "Oakland / Berkeley",
    zips: ["94610", "94611", "94612", "94618", "94703", "94705", "94707"],
  },
  {
    id: "area_la_west",
    hub_id: "hub_la",
    name: "West LA",
    zips: ["90024", "90025", "90034", "90049", "90064", "90066", "90067", "90069", "90291", "90292"],
  },
  {
    id: "area_la_east",
    hub_id: "hub_la",
    name: "Silver Lake / Echo Park",
    zips: ["90026", "90027", "90028", "90029", "90039"],
  },
];

export function checkZip(zip: string) {
  const z = zip.trim();
  for (const area of SERVICE_AREAS) {
    if (area.zips.includes(z)) {
      const hub = HUBS.find((h) => h.id === area.hub_id);
      return { in_service_area: true, area, hub };
    }
  }
  return { in_service_area: false, area: undefined, hub: undefined };
}
