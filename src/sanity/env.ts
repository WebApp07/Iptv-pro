export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-01";

export function assertSanityEnv(): void {
  if (!projectId) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID");
  }
  if (!dataset) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SANITY_DATASET");
  }
}
