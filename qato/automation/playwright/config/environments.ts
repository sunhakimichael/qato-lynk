import { loadEnvConfig } from "@qato/shared";

/** The three applications the automation suite targets. */
export type QatoApp = "cms" | "public" | "member";

/**
 * Returns the domain-root base URL for the given application in the
 * currently active environment (APP_ENV).
 */
export function getBaseUrl(app: QatoApp): string {
  const env = loadEnvConfig();

  switch (app) {
    case "cms":
      return env.CMS_BASE_URL;
    case "public":
      return env.PUBLIC_BASE_URL;
    case "member":
      return env.MEMBER_BASE_URL;
  }
}

/** Creator slug for the currently active environment. */
export function getCreatorSlug(): string {
  return loadEnvConfig().CREATOR_SLUG;
}
