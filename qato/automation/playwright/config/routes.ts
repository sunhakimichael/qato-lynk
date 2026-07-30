import { getBaseUrl, getCreatorSlug } from "./environments";

/**
 * Route Registry.
 *
 * Every route returns an ABSOLUTE url (base URL + path), not a relative path.
 * This is deliberate: Journeys frequently cross applications (e.g. Public
 * MyLink -> Member Area login), which live on different domains. Relying on
 * Playwright's per-project baseURL for relative navigation would break the
 * moment a journey needs to hop from one app to another.
 *
 * Only routes we actually know exist are registered here. Add a route only
 * when a Page Object or Journey needs to navigate to it.
 */

export const cmsRoutes = {
  /** CMS login screen. Username/email + password. */
  login: (): string => `${getBaseUrl("cms")}/login`,
};

export const publicRoutes = {
  /** Public storefront for the active environment's creator. */
  storefront: (): string => `${getBaseUrl("public")}/${getCreatorSlug()}`,
};

export const memberRoutes = {
  /** Member Area login for the active environment's creator. Email-based. */
  login: (): string => `${getBaseUrl("member")}/${getCreatorSlug()}/login`,
};
