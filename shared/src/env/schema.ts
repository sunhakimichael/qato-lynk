import { z } from "zod";

/**
 * The four environments Qato tests run against.
 * "local" mirrors "development" today (no local server exists yet) but is kept
 * distinct so a future local stack can diverge without touching every caller.
 */
export const AppEnvSchema = z.enum(["local", "development", "staging", "production"]);
export type AppEnv = z.infer<typeof AppEnvSchema>;

/**
 * Full, validated environment configuration.
 *
 * CMS_BASE_URL / PUBLIC_BASE_URL / MEMBER_BASE_URL are domain roots only.
 * Creator-specific paths (storefront slug, login routes) are composed from
 * CREATOR_SLUG at the Route Registry layer (Milestone 2), not stored here.
 */
export const EnvConfigSchema = z.object({
  APP_ENV: AppEnvSchema,

  CMS_BASE_URL: z.string().url(),
  PUBLIC_BASE_URL: z.string().url(),
  MEMBER_BASE_URL: z.string().url(),

  // Optional: no dedicated API host exists yet as of Milestone 1.
  API_BASE_URL: z.string().url().optional(),

  CREATOR_SLUG: z.string().min(1, "CREATOR_SLUG must not be empty"),

  DEFAULT_ACTION_TIMEOUT_MS: z.coerce.number().int().positive(),
  DEFAULT_NAVIGATION_TIMEOUT_MS: z.coerce.number().int().positive(),

  /**
   * How long to wait for a slow page (storefront, product detail,
   * checkout, payment) to show its key element before reloading once and
   * then failing. Deliberately longer than the action timeout — these
   * pages are known to sometimes take a long time to load.
   */
  PAGE_LOAD_TIMEOUT_MS: z.coerce.number().int().positive().default(120_000),
  /** Budget for a whole test. Must cover several slow page loads in a row. */
  TEST_TIMEOUT_MS: z.coerce.number().int().positive().default(600_000),

  CMS_USERNAME: z.string().min(1),
  CMS_PASSWORD: z.string().min(1),
  MEMBER_EMAIL: z.string().email(),
});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;
