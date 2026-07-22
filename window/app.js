/**
 * Window washing estimate — owner tool
 * One-time $8 / window · Recurring $7.50 / window
 * Ground / short ladder · max 2 stories
 */
(function () {
  "use strict";

  const RATE_ONE_TIME = 8;
  const RATE_RECURRING = 7.5;
  const MIN_ONE_TIME = 100;
  const MIN_RECURRING = 75;
  const KEY = "aw_window_calc_defaults_v1";

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
      if (d.windows != null) $("wc-windows").value = d.windows;
      if (d.property) $("wc-property").value = d.property;
      if (d.stories) $("wc-stories").value = d.stories;
      if (d.frequency) $("wc-frequency").value = d.frequency;
    } catch (_) {}
  }

  function saveDefaults() {
    const d = {
      windows: $("wc-windows").value,
      property: $("wc-property").value,
      stories: $("wc-stories").value,
      frequency: $("wc-frequency").value,
    };
    localStorage.setItem(KEY, JSON.stringify(d));
    alert("Defaults saved on this device.");
  }

  function reset() {
    $("wc-windows").value = 20;
    $("wc-property").value = "Home";
    $("wc-stories").value = "1";
    $("wc-frequency").value = "one-time";
    calc();
  }

  function calc() {
    const windows = Math.max(0, parseInt($("wc-windows").value, 10) || 0);
    const freq = $("wc-frequency").value;
    const recurring = freq !== "one-time";
    const rate = recurring ? RATE_RECURRING : RATE_ONE_TIME;
    const minJob = recurring ? MIN_RECURRING : MIN_ONE_TIME;
    const subtotal = windows * rate;
    const total = windows > 0 ? Math.max(subtotal, minJob) : 0;
    const oneTime = windows > 0 ? Math.max(windows * RATE_ONE_TIME, MIN_ONE_TIME) : 0;
    const savings = recurring && windows > 0 ? Math.max(0, oneTime - total) : 0;

    $("wc-rate").textContent = money(rate) + " / window";
    $("wc-subtotal").textContent = money(subtotal);
    $("wc-minimum").textContent = money(minJob);
    $("wc-total").textContent = money(total);

    const row = $("wc-savings-row");
    if (savings > 0) {
      row.hidden = false;
      $("wc-savings").textContent = money(savings) + " vs one-time";
    } else {
      row.hidden = true;
    }

    const freqLabel = $("wc-frequency").selectedOptions[0].text;
    $("wc-summary").textContent =
      windows <= 0
        ? "Enter windows (ground / short ladder, max 2 stories)."
        : `${windows} windows · ${$("wc-property").value} · ${$("wc-stories").value} stor${
            $("wc-stories").value === "1" ? "y" : "ies"
          } · ${freqLabel}`;

    const quote = [
      "AmenityWorks — Window washing estimate",
      `Windows: ${windows}`,
      `Property: ${$("wc-property").value}`,
      `Stories: ${$("wc-stories").value} (ground / short ladder only)`,
      `Frequency: ${freqLabel}`,
      `Rate: ${money(rate)}/window`,
      `Estimate: ${money(total)}`,
      savings > 0 ? `Savings vs one-time: ${money(savings)}` : null,
      "Ground / short ladder only · max 2 stories",
    ]
      .filter(Boolean)
      .join("\n");

    $("wc-copy").onclick = async () => {
      try {
        await navigator.clipboard.writeText(quote);
        alert("Estimate copied.");
      } catch {
        prompt("Copy estimate:", quote);
      }
    };
  }

  loadDefaults();
  ["wc-windows", "wc-property", "wc-stories", "wc-frequency"].forEach((id) => {
    $(id).addEventListener("input", calc);
    $(id).addEventListener("change", calc);
  });
  $("btnSave").addEventListener("click", saveDefaults);
  $("btnReset").addEventListener("click", reset);
  calc();
})();
