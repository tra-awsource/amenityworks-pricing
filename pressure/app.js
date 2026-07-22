/**
 * Pressure washing estimate — owner tool
 * Default $0.15/sq ft · Recurring 10% off
 * Min $150 one-time · $125 recurring
 */
(function () {
  "use strict";

  const RATE_DEFAULT = 0.15;
  const RECURRING_DISCOUNT = 0.1;
  const MIN_ONE_TIME = 150;
  const MIN_RECURRING = 125;
  const KEY = "aw_pressure_calc_defaults_v1";

  const $ = (id) => document.getElementById(id);

  function money(n) {
    return (
      "$" +
      n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function loadDefaults() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.sqft != null) $("pc-sqft").value = d.sqft;
      if (d.rate != null) $("pc-rate").value = d.rate;
      if (d.property) $("pc-property").value = d.property;
      if (d.surface) $("pc-surface").value = d.surface;
      if (d.frequency) $("pc-frequency").value = d.frequency;
    } catch (_) {}
  }

  function saveDefaults() {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        sqft: $("pc-sqft").value,
        rate: $("pc-rate").value,
        property: $("pc-property").value,
        surface: $("pc-surface").value,
        frequency: $("pc-frequency").value,
      })
    );
    alert("Defaults saved on this device.");
  }

  function reset() {
    $("pc-sqft").value = 5000;
    $("pc-rate").value = RATE_DEFAULT;
    $("pc-property").value = "Multifamily / apartment";
    $("pc-surface").value = "Breezeways / common concrete";
    $("pc-frequency").value = "one-time";
    calc();
  }

  function calc() {
    const sqft = Math.max(0, parseFloat($("pc-sqft").value) || 0);
    let rateIn = parseFloat($("pc-rate").value);
    if (isNaN(rateIn) || rateIn <= 0) rateIn = RATE_DEFAULT;
    const freq = $("pc-frequency").value;
    const recurring = freq !== "one-time";
    const rate = recurring ? rateIn * (1 - RECURRING_DISCOUNT) : rateIn;
    const minJob = recurring ? MIN_RECURRING : MIN_ONE_TIME;
    const subtotal = sqft * rate;
    const total = sqft > 0 ? Math.max(subtotal, minJob) : 0;
    const oneTime = sqft > 0 ? Math.max(sqft * rateIn, MIN_ONE_TIME) : 0;
    const savings = recurring && sqft > 0 ? Math.max(0, oneTime - total) : 0;

    $("pc-rate-out").textContent = money(rate) + " / sq ft";
    $("pc-subtotal").textContent = money(subtotal);
    $("pc-minimum").textContent = money(minJob);
    $("pc-total").textContent = money(total);

    const row = $("pc-savings-row");
    if (savings > 0) {
      row.hidden = false;
      $("pc-savings").textContent = money(savings) + " vs one-time";
    } else {
      row.hidden = true;
    }

    const freqLabel = $("pc-frequency").selectedOptions[0].text;
    $("pc-summary").textContent =
      sqft <= 0
        ? "Enter square footage of cleanable surface."
        : `${sqft.toLocaleString("en-US")} sq ft · ${$("pc-property").value} · ${$("pc-surface").value} · ${freqLabel}`;

    const quote = [
      "AmenityWorks — Pressure washing estimate",
      `Sq ft: ${sqft}`,
      `Property: ${$("pc-property").value}`,
      `Surface: ${$("pc-surface").value}`,
      `Frequency: ${freqLabel}`,
      `Rate: ${money(rate)}/sq ft`,
      `Estimate: ${money(total)}`,
      savings > 0 ? `Savings vs one-time: ${money(savings)}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    $("pc-copy").onclick = async () => {
      try {
        await navigator.clipboard.writeText(quote);
        alert("Estimate copied.");
      } catch {
        prompt("Copy estimate:", quote);
      }
    };
  }

  loadDefaults();
  ["pc-sqft", "pc-rate", "pc-property", "pc-surface", "pc-frequency"].forEach((id) => {
    $(id).addEventListener("input", calc);
    $(id).addEventListener("change", calc);
  });
  $("btnSave").addEventListener("click", saveDefaults);
  $("btnReset").addEventListener("click", reset);
  calc();
})();
