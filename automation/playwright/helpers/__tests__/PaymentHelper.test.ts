import { describe, expect, it } from "vitest";
import { PaymentHelper } from "../PaymentHelper";

describe("PaymentHelper.normalizeCurrency", () => {
  it("strips an IDR prefix and thousand-separator periods", () => {
    expect(PaymentHelper.normalizeCurrency("IDR 88.000")).toBe("88000");
  });

  it("strips a Rp prefix and thousand-separator commas", () => {
    expect(PaymentHelper.normalizeCurrency("Rp 88,000")).toBe("88000");
  });

  it("is case-insensitive on the currency prefix", () => {
    expect(PaymentHelper.normalizeCurrency("idr 85.000")).toBe("85000");
  });

  it("handles a plain digit string with no prefix or separators", () => {
    expect(PaymentHelper.normalizeCurrency("10")).toBe("10");
  });

  it("strips internal and surrounding whitespace", () => {
    expect(PaymentHelper.normalizeCurrency("  IDR  88 000  ")).toBe("88000");
  });

  it("produces equal output for two differently-formatted representations of the same amount", () => {
    const a = PaymentHelper.normalizeCurrency("IDR 88.000");
    const b = PaymentHelper.normalizeCurrency("Rp88,000");
    expect(a).toBe(b);
  });
});

describe("PaymentHelper.extractPaymentAmountFromText", () => {
  it("extracts the amount from a realistic combined invoice section", () => {
    const invoiceSectionText = [
      "Products :",
      "Japan Trip Ebook",
      "Inv. Number: 3376d95d320e986645d9fe7587e6e149",
      "Payment Amount",
      "IDR 88.000",
      "CIMB Niaga Virtual Account",
      "1199014290578423",
      "Copy",
    ].join("\n");

    expect(PaymentHelper.extractPaymentAmountFromText(invoiceSectionText)).toBe("88.000");
  });

  it("handles a comma thousand-separator instead of a period", () => {
    const invoiceSectionText = "Payment Amount\nRp88,000\nsome other content";
    expect(PaymentHelper.extractPaymentAmountFromText(invoiceSectionText)).toBe("88,000");
  });

  it("handles the label and value on the same line with no currency prefix", () => {
    const invoiceSectionText = "Payment Amount 85.000";
    expect(PaymentHelper.extractPaymentAmountFromText(invoiceSectionText)).toBe("85.000");
  });

  it("throws with the raw text included when no match is found", () => {
    const invoiceSectionText = "Products :\nSome Product\nNo amount label here";
    expect(() => PaymentHelper.extractPaymentAmountFromText(invoiceSectionText)).toThrow(
      /Could not extract Payment Amount/,
    );
  });
});
