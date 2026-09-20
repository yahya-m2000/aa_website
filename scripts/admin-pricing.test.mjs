import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";

// Exercise the display policy without contacting Graph or loading Next's server runtime.
const source = await readFile(
  new URL("../src/features/admin-orders/pricing-display.ts", import.meta.url),
  "utf8",
);
const { getPricingDisplay, storageFeeForDisplay } = await import(
  `data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString("base64")}`
);
const fields = {
  SubtotalUsd: 120,
  ServiceFeeUsd: 15,
  MarkupUsd: 10,
  DeliveryUsd: 45,
  IsDeliveryEstimated: true,
};

test("unweighed orders exclude the legacy delivery estimate and keep storage", () => {
  const result = getPricingDisplay(fields, 1);
  assert.equal(result.deliveryPending, true);
  assert.equal(result.deliveryUsd, null);
  assert.equal(result.knownChargesUsd, 146);
  assert.equal(result.deliveryAndStorageUsd, 1);
  assert.equal(getPricingDisplay(fields, 0).knownChargesUsd, 145);
});

test("weighed orders include actual delivery and storage", () => {
  const result = getPricingDisplay(
    { ...fields, DeliveryUsd: 119.6, IsDeliveryEstimated: false },
    1,
  );
  assert.equal(result.deliveryPending, false);
  assert.equal(result.deliveryAndStorageUsd, 120.6);
  assert.equal(result.knownChargesUsd, 265.6);
});

test("incomplete goods pricing never becomes an apparently valid total", () => {
  for (const invalid of [undefined, null, NaN, Infinity, -1, "120"]) {
    const result = getPricingDisplay({ ...fields, SubtotalUsd: invalid }, 0);
    assert.equal(result.goodsAndServiceUsd, null);
    assert.equal(result.knownChargesUsd, null);
  }
});

test("unknown delivery flags and missing charges stay pending", () => {
  assert.equal(
    getPricingDisplay({ ...fields, IsDeliveryEstimated: undefined }, 0)
      .deliveryPending,
    true,
  );
  for (const invalid of [undefined, null, NaN, Infinity, -1]) {
    const result = getPricingDisplay(
      { ...fields, IsDeliveryEstimated: false, DeliveryUsd: invalid },
      0,
    );
    assert.equal(result.deliveryPending, true);
    assert.equal(result.knownChargesUsd, 145);
  }
});

test("a confirmed zero delivery charge is valid, and source fields are never mutated", () => {
  const confirmed = Object.freeze({
    ...fields,
    DeliveryUsd: 0,
    IsDeliveryEstimated: false,
  });
  assert.equal(getPricingDisplay(confirmed, 0).deliveryPending, false);
  assert.equal(getPricingDisplay(confirmed, 0).knownChargesUsd, 145);
  getPricingDisplay(Object.freeze(fields), 0);
  assert.equal(fields.DeliveryUsd, 45);
});

test("storage display retains the seven-day grace period and daily rate", () => {
  const now = new Date("2026-09-19T12:00:00Z");
  assert.equal(storageFeeForDisplay(undefined, now), 0);
  assert.equal(storageFeeForDisplay("invalid", now), 0);
  assert.equal(storageFeeForDisplay("2026-09-12T12:00:00Z", now), 0);
  assert.equal(storageFeeForDisplay("2026-09-11T12:00:00Z", now), 0.5);
  assert.equal(storageFeeForDisplay("2026-09-09T12:00:00Z", now), 1.5);
  assert.equal(storageFeeForDisplay("2026-09-20T12:00:00Z", now), 0);
});
