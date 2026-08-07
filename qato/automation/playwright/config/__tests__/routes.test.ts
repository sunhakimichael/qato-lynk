import { beforeEach, describe, expect, it } from "vitest";
import { resetEnvConfigCache } from "@qato/shared";
import { cmsRoutes, memberRoutes, publicRoutes } from "../routes";

function setFixtureEnv(overrides: Partial<Record<string, string>> = {}): void {
  const base: Record<string, string> = {
    APP_ENV: "local",
    CMS_BASE_URL: "https://cms.fixture.test",
    PUBLIC_BASE_URL: "https://public.fixture.test",
    MEMBER_BASE_URL: "https://member.fixture.test",
    CREATOR_SLUG: "fixture-creator",
    DEFAULT_ACTION_TIMEOUT_MS: "5000",
    DEFAULT_NAVIGATION_TIMEOUT_MS: "10000",
    CMS_USERNAME: "fixture-user",
    CMS_PASSWORD: "fixture-pass",
    MEMBER_EMAIL: "fixture@example.com",
  };

  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    process.env[key] = value;
  }
}

describe("Route Registry", () => {
  beforeEach(() => {
    resetEnvConfigCache();
    setFixtureEnv();
  });

  it("composes an absolute CMS login URL", () => {
    expect(cmsRoutes.login()).toBe("https://cms.fixture.test/login");
  });

  it("composes an absolute CMS forgot-password URL", () => {
    expect(cmsRoutes.forgotPassword()).toBe("https://cms.fixture.test/forgot-password");
  });

  it("composes an absolute CMS dashboard URL", () => {
    expect(cmsRoutes.dashboard()).toBe("https://cms.fixture.test/v2/admin/dashboard");
  });

  it("composes an absolute CMS my-lynks home URL", () => {
    expect(cmsRoutes.myLynksHome()).toBe("https://cms.fixture.test/admin/my-lynks/home");
  });

  it("composes an absolute CMS orders home URL", () => {
    expect(cmsRoutes.ordersHome()).toBe("https://cms.fixture.test/admin/orders/home");
  });

  it("composes an absolute public storefront URL using the creator slug", () => {
    expect(publicRoutes.storefront()).toBe("https://public.fixture.test/fixture-creator");
  });

  it("composes an absolute member login URL using the creator slug", () => {
    expect(memberRoutes.login()).toBe("https://member.fixture.test/fixture-creator/login");
  });

  it("reflects a different creator slug per environment (e.g. production)", () => {
    resetEnvConfigCache();
    setFixtureEnv({ CREATOR_SLUG: "prod-creator" });

    expect(publicRoutes.storefront()).toBe("https://public.fixture.test/prod-creator");
    expect(memberRoutes.login()).toBe("https://member.fixture.test/prod-creator/login");
  });
});
