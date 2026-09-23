import { expect, type Page, type Locator } from "@playwright/test";
import { cmsOrdersLocators } from "../../locators/cms/ordersPage.locators";
import { cmsRoutes } from "../../config";
import { loadEnvConfig } from "@qato/shared";
import { waitForPageReady } from "../../helpers/waitForPageReady";
import { PaymentHelper } from "../../helpers/PaymentHelper";

export class CmsOrdersPage {
  constructor(private readonly page: Page) {}

  // async goto(): Promise<void> {
  //   await this.page.goto(cmsRoutes.ordersHome());
  // }

    async goto(): Promise<void> {
    const url = cmsRoutes.ordersHome();

    console.log(`Navigating to: ${url}`);

    const response = await this.page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: loadEnvConfig().PAGE_LOAD_TIMEOUT_MS,
    });
    await waitForPageReady(this.page, cmsOrdersLocators.productOrdersHeading(this.page), {
      pageName: "CMS Product Orders",
      reloadOnTimeout: true,
    });

    console.log(`Status: ${response?.status()}`);
    console.log(`Final URL: ${this.page.url()}`);
  }

  /** Waits for the Orders page reached some other way (e.g. the sidebar link) to be usable. */
  async waitForLoad(): Promise<void> {
    await this.page.waitForURL(/\/admin\/orders\/home/, {
      timeout: loadEnvConfig().PAGE_LOAD_TIMEOUT_MS,
      waitUntil: "domcontentloaded",
    });
    await waitForPageReady(this.page, cmsOrdersLocators.productOrdersHeading(this.page), {
      pageName: "CMS Product Orders",
      reloadOnTimeout: true,
    });
  }

  get productOrdersHeading(): Locator {
    return cmsOrdersLocators.productOrdersHeading(this.page);
  }

  /**
   * Waits for the order with this TRX ID to show up in the list, reloading
   * while it isn't there yet (a just-paid order can take a moment to be
   * recorded). Newest orders are listed first, so a fresh order is on page 1.
   */
  async waitForOrder(trxId: string): Promise<Locator> {
    const card = cmsOrdersLocators.orderCardByTrxId(this.page, trxId);
    await expect(async () => {
      if (!(await card.isVisible())) {
        await this.page.reload({ waitUntil: "domcontentloaded" });
      }
      await expect(card).toBeVisible({ timeout: 10_000 });
    }, `Order with TRX ID ${trxId} should appear in the CMS Orders list`).toPass({
      timeout: loadEnvConfig().PAGE_LOAD_TIMEOUT_MS,
    });
    return card;
  }

  /** What the order's card in the list shows. */
  async getOrderListEntry(trxId: string): Promise<CmsOrderListEntry> {
    const card = await this.waitForOrder(trxId);
    const data = cmsOrdersLocators.orderCardData(this.page, trxId);
    const cardText = await card.innerText();
    const total = cardText.match(/Total Transactions\s*(Rp\.?\s*[\d.,]+)/i)?.[1];
    if (!total) {
      throw new Error(`Could not read "Total Transactions" from order card ${trxId}: "${cardText}"`);
    }
    return {
      status: (await data.getAttribute("data-status")) ?? "",
      customerEmail: (await data.getAttribute("data-cust-email")) ?? "",
      cardText,
      total: PaymentHelper.parseRupiah(total),
    };
  }

  /** Clicks the order's (visible) Details link and waits for its panel. */
  async openOrderDetails(trxId: string): Promise<void> {
    const card = await this.waitForOrder(trxId);
    await card.getByText("Details", { exact: true }).filter({ visible: true }).click();
    await expect(cmsOrdersLocators.orderDetailsPanel(this.page, trxId)).toBeVisible();
  }

  /** Reads the Order Details panel. Call after openOrderDetails(). */
  async getOrderDetails(): Promise<CmsOrderDetails> {
    const itemLine = (await cmsOrdersLocators.orderDetailsItemLine(this.page).innerText()).trim();
    const itemLineMatch = itemLine.match(/^(\d+)\s*x\s*(Rp\.?\s*[\d.,]+)/i);
    if (!itemLineMatch) {
      throw new Error(`Could not read quantity/price from the Order Details item line: "${itemLine}"`);
    }
    const trxIdText = (await cmsOrdersLocators.orderDetailsTrxId(this.page).innerText()).trim();

    return {
      status: (await cmsOrdersLocators.orderDetailsStatus(this.page).innerText()).trim(),
      itemName: (await cmsOrdersLocators.orderDetailsItemName(this.page).innerText()).trim(),
      quantity: Number(itemLineMatch[1]),
      itemPrice: PaymentHelper.parseRupiah(itemLineMatch[2]!),
      trxId: trxIdText.replace(/^TRX ID\s*:\s*/i, "").trim(),
      itemTotal: PaymentHelper.parseRupiah(await cmsOrdersLocators.orderDetailsItemTotal(this.page).innerText()),
      total: PaymentHelper.parseRupiah(await cmsOrdersLocators.orderDetailsTotal(this.page).innerText()),
      customerEmail: (await cmsOrdersLocators.orderDetailsVars(this.page).getAttribute("data-cust-email")) ?? "",
      customerText: (await cmsOrdersLocators.orderDetailsCustomer(this.page).innerText()).trim(),
    };
  }
}

export interface CmsOrderListEntry {
  status: string;
  customerEmail: string;
  /** Full visible text of the card — contains the product name(s). */
  cardText: string;
  /** "Total Transactions" amount. */
  total: number;
}

export interface CmsOrderDetails {
  status: string;
  itemName: string;
  quantity: number;
  itemPrice: number;
  trxId: string;
  /** "Total item (n items)" amount. */
  itemTotal: number;
  total: number;
  /** From the panel's data attributes. */
  customerEmail: string;
  /** Visible text of the Customer block. */
  customerText: string;
}
