import type { Page } from "@playwright/test";
import { cmsMyLynkLocators } from "../../locators/cms/myLynkPage.locators";
import { cmsRoutes } from "../../config";
import { BlockListItem } from "../../components/BlockListItem";

export class CmsMyLynkPage {
  constructor(private readonly page: Page) {}

  /** Reuses the existing My Lynk route from Milestone 3 — no new Route Registry entry needed. */
  async goto(): Promise<void> {
    await this.page.goto(cmsRoutes.myLynksHome());
  }

  async clickMyLinkInBioTab(): Promise<void> {
    await cmsMyLynkLocators.myLinkInBioTab(this.page).click();
  }

  async clickLandingPagesTab(): Promise<void> {
    await cmsMyLynkLocators.landingPagesTab(this.page).click();
  }

  /** Opens the Share modal — instantiate components/ShareModal.ts afterward to interact with it. */
  async clickShare(): Promise<void> {
    await cmsMyLynkLocators.shareButton(this.page).click();
  }

  async clickCustomizeUrl(): Promise<void> {
    await cmsMyLynkLocators.customizeUrlLink(this.page).click();
  }

  /** Opens the Add New Block modal — instantiate components/AddNewBlockModal.ts afterward. */
  async clickAddNewBlock(): Promise<void> {
    await cmsMyLynkLocators.addNewBlockTrigger(this.page).click();
  }

  async clickPageTab(name: string): Promise<void> {
    await cmsMyLynkLocators.pageTabByName(this.page, name).click();
  }

  /** Total number of block cards currently in the list. */
  async blockCount(): Promise<number> {
    return cmsMyLynkLocators.blockListItems(this.page).count();
  }

  /** Scopes a BlockListItem by its position (0-indexed) in the list — never by a per-instance database id. */
  blockListItemByPosition(index: number): BlockListItem {
    return new BlockListItem(cmsMyLynkLocators.blockListItems(this.page).nth(index));
  }

  /** Scopes a BlockListItem by matching visible text anywhere within the card (e.g. its title). */
  blockListItemByText(text: string): BlockListItem {
    return new BlockListItem(cmsMyLynkLocators.blockListItems(this.page).filter({ hasText: text }));
  }
}
