import { planes, type Plan } from "@/data/site";

export function planPorId(id: string): Plan {
  const plan = planes.find((p) => p.id === id);
  if (!plan) throw new Error(`Falta el plan "${id}" en src/data/site.ts`);
  return plan;
}

/** El plan pase libre. */
export function paseLibre(): Plan {
  return planPorId("pase-libre");
}
