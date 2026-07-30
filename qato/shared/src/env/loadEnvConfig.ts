import path from "node:path";
import dotenv from "dotenv";
import { EnvConfigSchema, type EnvConfig, type AppEnv } from "./schema";

const ENV_FILE_BY_APP_ENV: Record<AppEnv, string> = {
  local: ".env.local",
  development: ".env.dev",
  staging: ".env.staging",
  production: ".env.prod",
};

function resolveAppEnv(): AppEnv {
  const raw = process.env.APP_ENV ?? "local";
  const validAppEnvs = Object.keys(ENV_FILE_BY_APP_ENV);

  if (!validAppEnvs.includes(raw)) {
    throw new Error(
      `Invalid APP_ENV "${raw}". Expected one of: ${validAppEnvs.join(", ")}`,
    );
  }

  return raw as AppEnv;
}

function formatZodIssues(issues: { path: (string | number)[]; message: string }[]): string {
  return issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
}

let cachedConfig: EnvConfig | undefined;

/**
 * Loads and validates the environment config for the current APP_ENV.
 * Result is cached per process — call resetEnvConfigCache() in tests that
 * need to reload with a different APP_ENV.
 */
export function loadEnvConfig(rootDir: string = process.cwd()): EnvConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const appEnv = resolveAppEnv();
  const envFileName = ENV_FILE_BY_APP_ENV[appEnv];
  const envFilePath = path.resolve(rootDir, envFileName);

  dotenv.config({ path: envFilePath });

  // dotenv leaves unset-but-declared variables as empty strings (e.g.
  // "API_BASE_URL="). Treat those as absent so optional fields validate
  // correctly instead of failing url()/email() checks on "".
  const rawMerged: Record<string, string | undefined> = { ...process.env, APP_ENV: appEnv };
  const normalized = Object.fromEntries(
    Object.entries(rawMerged).map(([key, value]) => [key, value === "" ? undefined : value]),
  );

  const parsed = EnvConfigSchema.safeParse(normalized);

  if (!parsed.success) {
    throw new Error(
      `Environment validation failed for "${appEnv}" (${envFileName}):\n` +
        formatZodIssues(parsed.error.issues),
    );
  }

  cachedConfig = parsed.data;
  return cachedConfig;
}

/** Clears the cached config. Intended for test isolation only. */
export function resetEnvConfigCache(): void {
  cachedConfig = undefined;
}
