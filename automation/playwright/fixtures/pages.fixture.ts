import { test as base } from "@playwright/test";
import { CmsLoginPage } from "../pages/cms/CmsLoginPage";
import { CmsHomePage } from "../pages/cms/CmsHomePage";
import { CmsOrdersPage } from "../pages/cms/CmsOrdersPage";
import { PublicStorefrontPage } from "../pages/public/PublicStorefrontPage";
import { PublicProductDetailPage } from "../pages/public/PublicProductDetailPage";
import { PublicCheckoutPage } from "../pages/public/PublicCheckoutPage";
import { PublicPaymentStatusPage } from "../pages/public/PublicPaymentStatusPage";
import { MemberLoginPage } from "../pages/member/MemberLoginPage";
import { OtpModal } from "../components/OtpModal";

export interface PageObjectFixtures {
  cmsLoginPage: CmsLoginPage;
  cmsHomePage: CmsHomePage;
  cmsOrdersPage: CmsOrdersPage;
  publicStorefrontPage: PublicStorefrontPage;
  publicProductDetailPage: PublicProductDetailPage;
  publicCheckoutPage: PublicCheckoutPage;
  publicPaymentStatusPage: PublicPaymentStatusPage;
  memberLoginPage: MemberLoginPage;
  otpModal: OtpModal;
}

export const test = base.extend<PageObjectFixtures>({
  cmsLoginPage: async ({ page }, use) => {
    await use(new CmsLoginPage(page));
  },
  cmsHomePage: async ({ page }, use) => {
    await use(new CmsHomePage(page));
  },
  cmsOrdersPage: async ({ page }, use) => {
    await use(new CmsOrdersPage(page));
  },
  publicStorefrontPage: async ({ page }, use) => {
    await use(new PublicStorefrontPage(page));
  },
  publicProductDetailPage: async ({ page }, use) => {
    await use(new PublicProductDetailPage(page));
  },
  publicCheckoutPage: async ({ page }, use) => {
    await use(new PublicCheckoutPage(page));
  },
  publicPaymentStatusPage: async ({ page }, use) => {
    await use(new PublicPaymentStatusPage(page));
  },
  memberLoginPage: async ({ page }, use) => {
    await use(new MemberLoginPage(page));
  },
  otpModal: async ({ page }, use) => {
    await use(new OtpModal(page));
  },
});
