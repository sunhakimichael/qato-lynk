import { test } from "../../fixtures";
import { viewProductOrders } from "../../journeys/creator/viewProductOrders.journey";
import { expectProductOrdersPageLoaded } from "../../assertions";

test(
  "creator can log in and view the Product Orders list",
  { tag: ["@cms", "@smoke", "@regression"] },
  async ({ page }) => {
    const ordersPage = await viewProductOrders(page);
    await expectProductOrdersPageLoaded(ordersPage);
  },
);
