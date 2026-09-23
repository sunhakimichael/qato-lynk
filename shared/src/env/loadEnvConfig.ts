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

/**
 * When RANDOMIZE_MEMBER_EMAIL=true, turns a Gmail MEMBER_EMAIL into a random
 * dotted variant, e.g. "xomaajah123@gmail.com" -> "xoma.ajah.123@gmail.com".
 * Gmail ignores dots in the local part, so every variant lands in the same
 * real inbox (the member OTP must be readable), while Lynk treats it as a
 * new email. "+" aliases are not used because Lynk's forms reject them.
 *
 * The resolved value is written back to process.env and the flag is turned
 * off, so Playwright workers — which inherit the main process env (dotenv
 * never overrides existing vars) — reuse the SAME email instead of
 * generating a new one. Checkout and member login stay in sync for the run.
 */
function resolveRandomMemberEmail(): void {
  if (process.env.RANDOMIZE_MEMBER_EMAIL !== "true") {
    return;
  }

  const email = process.env.MEMBER_EMAIL ?? "";
  const [localPart, domain] = email.split("@");
  if (!localPart || !["gmail.com", "googlemail.com"].includes(domain?.toLowerCase() ?? "")) {
    throw new Error(
      `RANDOMIZE_MEMBER_EMAIL=true requires a Gmail MEMBER_EMAIL (dot aliases only work on Gmail), got "${email}"`,
    );
  }

  const chars = localPart.replace(/\./g, "").split("");
  if (chars.length < 2) {
    throw new Error(`MEMBER_EMAIL local part is too short to randomize: "${email}"`);
  }

  // Insert 1–3 dots at random gaps between characters: always differs from
  // the base address, but stays short and readable.
  const gaps = chars.slice(1).map((_, i) => i + 1);
  const dotCount = Math.min(gaps.length, 1 + Math.floor(Math.random() * 3));
  const dotted = new Set<number>();
  while (dotted.size < dotCount) {
    dotted.add(gaps[Math.floor(Math.random() * gaps.length)]!);
  }
  const randomized = chars.map((char, i) => (dotted.has(i) ? `.${char}` : char)).join("");

  process.env.MEMBER_EMAIL = `${randomized}@${domain}`;
  process.env.RANDOMIZE_MEMBER_EMAIL = "false";
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
  resolveRandomMemberEmail();

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
