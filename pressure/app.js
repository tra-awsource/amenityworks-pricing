/**
 * AmenityWorks Power Washing — Pressure Wash Pro quote builder
 * Catalog matches the AmenityWorks Power Washing Price Sheet.
 * Rates (midpoints of sheet ranges) saved to localStorage under Rates.
 */

const STORAGE_KEY = "pw-pricing-settings-v2";
const CATALOG_VERSION = 2;

/** Midpoint helper for sheet ranges */
const mid = (a, b) => Math.round(((a + b) / 2) * 1000) / 1000;

/**
 * AmenityWorks Power Washing Price Sheet
 * rate = default bid (mid of range when a range is given)
 * rateMin / rateMax = sheet range for reference
 */
const DEFAULT_SERVICES = [
  // —— Residential ——
  {
    id: "driveway",
    name: "Driveways",
    unit: "sq ft",
    rate: mid(0.2, 0.3),
    rateMin: 0.2,
    rateMax: 0.3,
    group: "Residential",
  },
  {
    id: "walkways",
    name: "Walkways",
    unit: "sq ft",
    rate: 0.25,
    rateMin: 0.25,
    rateMax: 0.25,
    group: "Residential",
  },
  {
    id: "house_wash",
    name: "House Wash (Soft Wash)",
    unit: "sq ft",
    rate: mid(0.25, 0.3),
    rateMin: 0.25,
    rateMax: 0.3,
    group: "Residential",
  },
  {
    id: "patios",
    name: "Patios / Porches",
    unit: "sq ft",
    rate: mid(0.25, 0.35),
    rateMin: 0.25,
    rateMax: 0.35,
    group: "Residential",
  },
  {
    id: "pool_decks",
    name: "Pool Decks",
    unit: "sq ft",
    rate: mid(0.3, 0.4),
    rateMin: 0.3,
    rateMax: 0.4,
    group: "Residential",
  },
  {
    id: "roof",
    name: "Roof Soft Wash",
    unit: "sq ft",
    rate: mid(0.35, 0.6),
    rateMin: 0.35,
    rateMax: 0.6,
    group: "Residential",
  },

  // —— Commercial & Multifamily ——
  {
    id: "flat_work",
    name: "Flat Work (Hallways, Breezeways, Walkways)",
    unit: "sq ft",
    rate: mid(0.13, 0.18),
    rateMin: 0.13,
    rateMax: 0.18,
    group: "Commercial & Multifamily",
    heavyAdd: 0.05, // Heavy Soiled Areas: +$0.05 / sq ft
  },
  {
    id: "heavy_soiled_sqft",
    name: "Heavy Soiled Areas (add-on)",
    unit: "sq ft",
    rate: 0.05,
    rateMin: 0.05,
    rateMax: 0.05,
    group: "Commercial & Multifamily",
  },
  {
    id: "ceilings_std",
    name: "Ceilings — 3-Story Standard (8 ft)",
    unit: "building",
    rate: mid(75, 150),
    rateMin: 75,
    rateMax: 150,
    group: "Commercial & Multifamily",
  },
  {
    id: "ceilings_high",
    name: "Ceilings — Entry/High (24–30 ft)",
    unit: "building",
    rate: mid(200, 350),
    rateMin: 200,
    rateMax: 350,
    group: "Commercial & Multifamily",
  },
  {
    id: "no_water",
    name: "No Water On Site (add-on)",
    unit: "sq ft",
    rate: 0.03,
    rateMin: 0.03,
    rateMax: 0.03,
    group: "Commercial & Multifamily",
  },
  {
    id: "travel_sqft",
    name: "Travel Outside Austin (add-on)",
    unit: "sq ft",
    rate: mid(0.02, 0.05),
    rateMin: 0.02,
    rateMax: 0.05,
    group: "Commercial & Multifamily",
  },

  // —— Stairwells (stairs ≈ 6 sq ft each) ——
  {
    id: "stairs",
    name: "Stairwells — Treads & Landings",
    unit: "stair",
    rate: mid(2, 3),
    rateMin: 2,
    rateMax: 3,
    group: "Stairwells",
    heavyAdd: 0.5, // Heavily Soiled Add-on: +$0.50 per stair
    note: "Stairs ≈ 6 sq ft each · per level",
  },
  {
    id: "stairs_heavy",
    name: "Stairwells — Heavily Soiled Add-on",
    unit: "stair",
    rate: 0.5,
    rateMin: 0.5,
    rateMax: 0.5,
    group: "Stairwells",
  },

  // —— Additional Services ——
  {
    id: "chemical",
    name: "Chemical Treatment",
    unit: "treatment",
    rate: mid(25, 75),
    rateMin: 25,
    rateMax: 75,
    group: "Additional Services",
  },
  {
    id: "rust",
    name: "Rust Removal (quoted on-site)",
    unit: "flat",
    rate: 0,
    rateMin: 0,
    rateMax: 0,
    group: "Additional Services",
    quotedOnSite: true,
  },
  {
    id: "oil_stain",
    name: "Oil Stain Treatment",
    unit: "spot",
    rate: mid(15, 50),
    rateMin: 15,
    rateMax: 50,
    group: "Additional Services",
  },
  {
    id: "gum",
    name: "Gum Removal",
    unit: "spot",
    rate: mid(1, 2),
    rateMin: 1,
    rateMax: 2,
    group: "Additional Services",
  },
  {
    id: "custom",
    name: "Custom / other",
    unit: "flat",
    rate: 0,
    rateMin: 0,
    rateMax: 0,
    group: "Additional Services",
  },
];

const DEFAULT_SETTINGS = {
  catalogVersion: CATALOG_VERSION,
  businessName: "AmenityWorks",
  minJobFee: 150,
  // Sheet uses explicit heavy add-ons (+$0.05/sq ft, +$0.50/stair).
  // Multipliers stay at 1.0 so they don't stack unless you raise them under Rates.
  multipliers: { light: 1.0, medium: 1.0, heavy: 1.0 },
  services: DEFAULT_SERVICES.map((s) => ({ ...s })),
};

/** @type {typeof DEFAULT_SETTINGS} */
let settings = loadSettings();

/** @type {{ id: string, serviceId: string, quantity: number|string, condition: string, rate: number|string|null }[]} */
let lines = [];

// ——— DOM ———
const els = {
  businessNameDisplay: document.getElementById("businessNameDisplay"),
  serviceLines: document.getElementById("serviceLines"),
  emptyHint: document.getElementById("emptyServicesHint"),
  quoteLines: document.getElementById("quoteLines"),
  subtotalDisplay: document.getElementById("subtotalDisplay"),
  discountRow: document.getElementById("discountRow"),
  discountDisplay: document.getElementById("discountDisplay"),
  taxRow: document.getElementById("taxRow"),
  taxDisplay: document.getElementById("taxDisplay"),
  totalDisplay: document.getElementById("totalDisplay"),
  minNote: document.getElementById("minNote"),
  travelFee: document.getElementById("travelFee"),
  discountPct: document.getElementById("discountPct"),
  taxPct: document.getElementById("taxPct"),
  quoteNotes: document.getElementById("quoteNotes"),
  customerName: document.getElementById("customerName"),
  customerContact: document.getElementById("customerContact"),
  jobAddress: document.getElementById("jobAddress"),
  settingsModal: document.getElementById("settingsModal"),
  businessName: document.getElementById("businessName"),
  minJobFee: document.getElementById("minJobFee"),
  multLight: document.getElementById("multLight"),
  multMedium: document.getElementById("multMedium"),
  multHeavy: document.getElementById("multHeavy"),
  ratesTableBody: document.querySelector("#ratesTable tbody"),
  copyStatus: document.getElementById("copyStatus"),
  printSheet: document.getElementById("printSheet"),
};

// ——— Settings ———
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    const parsed = JSON.parse(raw);

    // Force new price-sheet catalog when version changes
    if (parsed.catalogVersion !== CATALOG_VERSION) {
      return {
        ...structuredClone(DEFAULT_SETTINGS),
        businessName: parsed.businessName || DEFAULT_SETTINGS.businessName,
        minJobFee: parsed.minJobFee ?? DEFAULT_SETTINGS.minJobFee,
      };
    }

    const services =
      Array.isArray(parsed.services) && parsed.services.length
        ? mergeServices(parsed.services)
        : structuredClone(DEFAULT_SERVICES);

    return {
      ...structuredClone(DEFAULT_SETTINGS),
      ...parsed,
      catalogVersion: CATALOG_VERSION,
      multipliers: { ...DEFAULT_SETTINGS.multipliers, ...(parsed.multipliers || {}) },
      services,
    };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

/** Keep saved rates/min-max if same service id still exists */
function mergeServices(saved) {
  const byId = new Map(saved.map((s) => [s.id, s]));
  return DEFAULT_SERVICES.map((def) => {
    const prev = byId.get(def.id);
    if (!prev) return { ...def };
    return {
      ...def,
      rate: prev.rate != null ? Number(prev.rate) : def.rate,
      rateMin: def.rateMin,
      rateMax: def.rateMax,
      name: def.name,
      unit: def.unit,
      group: def.group,
      heavyAdd: def.heavyAdd,
      quotedOnSite: def.quotedOnSite,
      note: def.note,
    };
  });
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function applyBusinessName() {
  els.businessNameDisplay.textContent = settings.businessName || "AmenityWorks";
  document.title = `${settings.businessName || "AmenityWorks"} · Pressure Wash Pro`;
}

// ——— Money / rate helpers ———
const money = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

function formatRate(n) {
  const x = Number(n) || 0;
  if (x >= 10) return x.toFixed(2);
  if (x >= 1) return x.toFixed(2);
  return x.toFixed(2);
}

function rangeLabel(svc) {
  const min = Number(svc.rateMin);
  const max = Number(svc.rateMax);
  if (svc.quotedOnSite) return "On-site";
  if (Number.isFinite(min) && Number.isFinite(max) && min !== max) {
    return `$${formatRate(min)}–$${formatRate(max)}`;
  }
  if (Number.isFinite(min)) return `$${formatRate(min)}`;
  return `$${formatRate(svc.rate)}`;
}

function getService(id) {
  return settings.services.find((s) => s.id === id) || settings.services[0];
}

function conditionMult(key) {
  const m = settings.multipliers;
  if (key === "medium") return m.medium;
  if (key === "heavy") return m.heavy;
  return m.light;
}

function effectiveRate(line, svc) {
  if (line.rate !== null && line.rate !== "" && line.rate !== undefined) {
    return Math.max(0, Number(line.rate) || 0);
  }
  return Math.max(0, Number(svc.rate) || 0);
}

function lineAmount(line) {
  const svc = getService(line.serviceId);
  const qty = Math.max(0, Number(line.quantity) || 0);
  const rate = effectiveRate(line, svc);

  // Flat / custom = amount entered in quantity field
  if (svc.unit === "flat") {
    return qty * conditionMult(line.condition);
  }

  let amount = qty * rate;

  // Sheet-style heavy add-ons (e.g. +$0.05/sq ft, +$0.50/stair)
  if (svc.heavyAdd != null && Number(svc.heavyAdd) > 0) {
    if (line.condition === "heavy") {
      amount += qty * Number(svc.heavyAdd);
    } else if (line.condition === "medium") {
      amount += qty * Number(svc.heavyAdd) * 0.5;
    }
  } else {
    amount *= conditionMult(line.condition);
  }

  return amount;
}

function computeQuote() {
  const travel = Math.max(0, Number(els.travelFee.value) || 0);
  const discountPct = Math.min(100, Math.max(0, Number(els.discountPct.value) || 0));
  const taxPct = Math.max(0, Number(els.taxPct.value) || 0);

  const serviceItems = lines.map((line) => {
    const svc = getService(line.serviceId);
    const amount = lineAmount(line);
    return { line, svc, amount };
  });

  let servicesSub = serviceItems.reduce((sum, i) => sum + i.amount, 0);
  let subtotal = servicesSub + travel;
  let minApplied = false;

  if (subtotal > 0 && subtotal < settings.minJobFee) {
    subtotal = settings.minJobFee;
    minApplied = true;
  }

  const discount = subtotal * (discountPct / 100);
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * (taxPct / 100);
  const total = afterDiscount + tax;

  return {
    serviceItems,
    travel,
    servicesSub,
    subtotal,
    discount,
    discountPct,
    tax,
    taxPct,
    total,
    minApplied,
  };
}

// ——— Render services ———
function uid() {
  return `L${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function unitLabelFor(svc) {
  if (svc.unit === "flat") return "Amount ($)";
  if (svc.unit === "stair") return "Qty (stairs)";
  if (svc.unit === "building") return "Qty (buildings)";
  if (svc.unit === "treatment") return "Qty (treatments)";
  if (svc.unit === "spot") return "Qty (spots)";
  return `Qty (${svc.unit})`;
}

function fillServiceSelect(select, selectedId) {
  select.innerHTML = "";
  const groups = [];
  const map = new Map();
  for (const s of settings.services) {
    const g = s.group || "Other";
    if (!map.has(g)) {
      map.set(g, []);
      groups.push(g);
    }
    map.get(g).push(s);
  }
  for (const g of groups) {
    const og = document.createElement("optgroup");
    og.label = g;
    for (const s of map.get(g)) {
      const opt = document.createElement("option");
      opt.value = s.id;
      const unitBit = s.unit === "flat" ? "custom" : s.unit;
      const sheet = rangeLabel(s);
      opt.textContent = `${s.name} · ${sheet}/${unitBit}`;
      if (s.id === selectedId) opt.selected = true;
      og.appendChild(opt);
    }
    select.appendChild(og);
  }
}

function addServiceLine(preset = {}) {
  const serviceId = preset.serviceId || "driveway";
  const svc = getService(serviceId);
  lines.push({
    id: uid(),
    serviceId,
    quantity: preset.quantity ?? "",
    condition: preset.condition || "light",
    rate: preset.rate != null ? preset.rate : svc.rate,
  });
  renderServiceLines();
  recalc();
}

function removeServiceLine(id) {
  lines = lines.filter((l) => l.id !== id);
  renderServiceLines();
  recalc();
}

function renderServiceLines() {
  els.serviceLines.innerHTML = "";
  els.emptyHint.hidden = lines.length > 0;

  for (const line of lines) {
    const svc = getService(line.serviceId);
    const row = document.createElement("div");
    row.className = "service-line";
    row.dataset.id = line.id;

    const rateVal =
      line.rate !== null && line.rate !== "" && line.rate !== undefined
        ? line.rate
        : svc.rate;
    const sheetHint = rangeLabel(svc);
    const heavyHint =
      svc.heavyAdd != null && Number(svc.heavyAdd) > 0
        ? ` · heavy +$${formatRate(svc.heavyAdd)}/${svc.unit}`
        : "";

    row.innerHTML = `
      <label class="field field-service">
        <span>Service</span>
        <select data-field="serviceId" aria-label="Service type"></select>
      </label>
      <label class="field">
        <span>Condition</span>
        <select data-field="condition" aria-label="Soil condition">
          <option value="light">Light (base)</option>
          <option value="medium">Medium</option>
          <option value="heavy">Heavy / soiled</option>
        </select>
      </label>
      <label class="field">
        <span class="qty-label">${unitLabelFor(svc)}</span>
        <input type="number" data-field="quantity" min="0" step="any" placeholder="0" value="${line.quantity}" inputmode="decimal" />
      </label>
      <label class="field">
        <span>Rate ($)<small class="rate-sheet"> sheet ${sheetHint}${heavyHint}</small></span>
        <input type="number" data-field="rate" min="0" step="any" value="${rateVal}" inputmode="decimal" ${svc.unit === "flat" && !svc.quotedOnSite ? "" : ""} />
      </label>
      <div class="field">
        <span>Line total</span>
        <div class="line-total" data-line-total>${money(lineAmount(line))}</div>
      </div>
      <div class="remove-wrap">
        <button type="button" class="btn-danger" data-remove title="Remove service">Remove</button>
      </div>
    `;

    const select = row.querySelector('[data-field="serviceId"]');
    fillServiceSelect(select, line.serviceId);

    row.querySelector('[data-field="condition"]').value = line.condition;

    row.querySelector('[data-field="serviceId"]').addEventListener("change", (e) => {
      line.serviceId = e.target.value;
      const newSvc = getService(line.serviceId);
      line.rate = newSvc.rate;
      const qtyLabel = row.querySelector(".qty-label");
      qtyLabel.textContent = unitLabelFor(newSvc);
      const rateInput = row.querySelector('[data-field="rate"]');
      rateInput.value = newSvc.rate;
      const sheetEl = row.querySelector(".rate-sheet");
      if (sheetEl) {
        const h =
          newSvc.heavyAdd != null && Number(newSvc.heavyAdd) > 0
            ? ` · heavy +$${formatRate(newSvc.heavyAdd)}/${newSvc.unit}`
            : "";
        sheetEl.textContent = ` sheet ${rangeLabel(newSvc)}${h}`;
      }
      recalc();
      updateLineTotal(row, line);
    });

    row.querySelector('[data-field="condition"]').addEventListener("change", (e) => {
      line.condition = e.target.value;
      recalc();
      updateLineTotal(row, line);
    });

    row.querySelector('[data-field="quantity"]').addEventListener("input", (e) => {
      line.quantity = e.target.value === "" ? "" : Number(e.target.value);
      recalc();
      updateLineTotal(row, line);
    });

    row.querySelector('[data-field="rate"]').addEventListener("input", (e) => {
      line.rate = e.target.value === "" ? "" : Number(e.target.value);
      recalc();
      updateLineTotal(row, line);
    });

    row.querySelector("[data-remove]").addEventListener("click", () => {
      removeServiceLine(line.id);
    });

    els.serviceLines.appendChild(row);
  }
}

function updateLineTotal(row, line) {
  const el = row.querySelector("[data-line-total]");
  if (el) el.textContent = money(lineAmount(line));
}

// ——— Quote UI ———
function recalc() {
  const q = computeQuote();

  if (!q.serviceItems.length) {
    els.quoteLines.innerHTML = `<p class="quote-empty">No services yet.</p>`;
  } else {
    els.quoteLines.innerHTML = q.serviceItems
      .map(({ line, svc, amount }) => {
        const cond =
          line.condition === "medium"
            ? " · medium"
            : line.condition === "heavy"
              ? " · heavy / soiled"
              : "";
        const rate = effectiveRate(line, svc);
        let qtyPart;
        if (svc.unit === "flat") {
          qtyPart = svc.quotedOnSite ? "on-site / custom" : "custom";
        } else {
          qtyPart = `${Number(line.quantity) || 0} ${svc.unit} @ $${formatRate(rate)}${cond}`;
        }
        if (svc.heavyAdd && line.condition === "heavy") {
          qtyPart += ` (+$${formatRate(svc.heavyAdd)} ${svc.unit} heavy)`;
        }
        return `
          <div class="quote-line">
            <div class="ql-label"><strong>${escapeHtml(svc.name)}</strong>${escapeHtml(qtyPart)}</div>
            <div class="ql-price">${money(amount)}</div>
          </div>`;
      })
      .join("");

    if (q.travel > 0) {
      els.quoteLines.innerHTML += `
        <div class="quote-line">
          <div class="ql-label"><strong>Travel / trip fee (flat)</strong></div>
          <div class="ql-price">${money(q.travel)}</div>
        </div>`;
    }
  }

  document.querySelectorAll(".service-line").forEach((row) => {
    const id = row.dataset.id;
    const line = lines.find((l) => l.id === id);
    if (line) updateLineTotal(row, line);
  });

  els.subtotalDisplay.textContent = money(q.subtotal);
  els.discountRow.hidden = q.discount <= 0;
  els.discountDisplay.textContent = `−${money(q.discount)}`;
  els.taxRow.hidden = q.tax <= 0;
  els.taxDisplay.textContent = money(q.tax);
  els.totalDisplay.textContent = money(q.total);
  els.minNote.hidden = !q.minApplied;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ——— Copy / print ———
function buildQuoteText() {
  const q = computeQuote();
  const name = els.customerName.value.trim() || "Customer";
  const contact = els.customerContact.value.trim();
  const address = els.jobAddress.value.trim();
  const notes = els.quoteNotes.value.trim();
  const biz = settings.businessName || "AmenityWorks";

  const linesText = q.serviceItems
    .map(({ line, svc, amount }) => {
      const rate = effectiveRate(line, svc);
      const qty =
        svc.unit === "flat"
          ? svc.quotedOnSite
            ? "quoted on-site"
            : "custom"
          : `${Number(line.quantity) || 0} ${svc.unit} @ $${formatRate(rate)}`;
      const cond = line.condition !== "light" ? ` (${line.condition})` : "";
      return `  • ${svc.name}: ${qty}${cond} — ${money(amount)}`;
    })
    .join("\n");

  let text = `${biz} — Power Washing Quote\n`;
  text += `Prepared: ${new Date().toLocaleDateString()}\n\n`;
  text += `Customer: ${name}\n`;
  if (contact) text += `Contact: ${contact}\n`;
  if (address) text += `Address: ${address}\n`;
  text += `\nServices:\n${linesText || "  (none)"}\n`;
  if (q.travel > 0) text += `  • Travel / trip fee — ${money(q.travel)}\n`;
  text += `\nSubtotal: ${money(q.subtotal)}\n`;
  if (q.discount > 0) text += `Discount (${q.discountPct}%): −${money(q.discount)}\n`;
  if (q.tax > 0) text += `Tax (${q.taxPct}%): ${money(q.tax)}\n`;
  text += `TOTAL: ${money(q.total)}\n`;
  if (q.minApplied) text += `(Minimum job fee applied)\n`;
  if (notes) text += `\nNotes: ${notes}\n`;
  text += `\nThank you for the opportunity!`;
  return text;
}

async function copyQuote() {
  const text = buildQuoteText();
  try {
    await navigator.clipboard.writeText(text);
    els.copyStatus.textContent = "Quote copied to clipboard";
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    els.copyStatus.textContent = "Quote copied to clipboard";
  }
  setTimeout(() => {
    els.copyStatus.textContent = "";
  }, 2500);
}

function printQuote() {
  const q = computeQuote();
  const name = els.customerName.value.trim() || "—";
  const contact = els.customerContact.value.trim();
  const address = els.jobAddress.value.trim();
  const notes = els.quoteNotes.value.trim();
  const biz = settings.businessName || "AmenityWorks";

  const rows = q.serviceItems
    .map(({ line, svc, amount }) => {
      const rate = effectiveRate(line, svc);
      const qty =
        svc.unit === "flat"
          ? svc.quotedOnSite
            ? "Quoted on-site"
            : "Custom"
          : `${Number(line.quantity) || 0} ${svc.unit} @ $${formatRate(rate)}${line.condition !== "light" ? ` · ${line.condition}` : ""}`;
      return `<tr><td>${escapeHtml(svc.name)}<br><small>${escapeHtml(qty)}</small></td><td>${money(amount)}</td></tr>`;
    })
    .join("");

  const travelRow =
    q.travel > 0
      ? `<tr><td>Travel / trip fee</td><td>${money(q.travel)}</td></tr>`
      : "";

  els.printSheet.innerHTML = `
    <h1>${escapeHtml(biz)}</h1>
    <div class="meta">
      Power Washing Quote · ${new Date().toLocaleDateString()}<br>
      Customer: ${escapeHtml(name)}
      ${contact ? `<br>Contact: ${escapeHtml(contact)}` : ""}
      ${address ? `<br>Job site: ${escapeHtml(address)}` : ""}
    </div>
    <table>
      <thead><tr><th>Description</th><th>Amount</th></tr></thead>
      <tbody>${rows || "<tr><td colspan='2'>No services</td></tr>"}${travelRow}</tbody>
    </table>
    <div class="totals-print">
      <div><span>Subtotal</span><span>${money(q.subtotal)}</span></div>
      ${q.discount > 0 ? `<div><span>Discount</span><span>−${money(q.discount)}</span></div>` : ""}
      ${q.tax > 0 ? `<div><span>Tax</span><span>${money(q.tax)}</span></div>` : ""}
      <div class="grand-print"><span>Total</span><span>${money(q.total)}</span></div>
    </div>
    ${notes ? `<div class="notes"><strong>Notes</strong><br>${escapeHtml(notes)}</div>` : ""}
    <div class="notes" style="margin-top:2rem">Thank you for choosing ${escapeHtml(biz)}.</div>
  `;

  window.print();
}

// ——— Settings modal ———
function openSettings() {
  els.businessName.value = settings.businessName;
  els.minJobFee.value = settings.minJobFee;
  els.multLight.value = settings.multipliers.light;
  els.multMedium.value = settings.multipliers.medium;
  els.multHeavy.value = settings.multipliers.heavy;
  renderRatesTable();
  els.settingsModal.hidden = false;
}

function closeSettings() {
  els.settingsModal.hidden = true;
}

function renderRatesTable() {
  els.ratesTableBody.innerHTML = "";
  let lastGroup = "";
  for (const s of settings.services) {
    if (s.group && s.group !== lastGroup) {
      lastGroup = s.group;
      const trG = document.createElement("tr");
      trG.className = "rates-group-row";
      trG.innerHTML = `<td colspan="4">${escapeHtml(s.group)}</td>`;
      els.ratesTableBody.appendChild(trG);
    }
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(s.name)}${s.note ? `<br><small class="muted">${escapeHtml(s.note)}</small>` : ""}${
        s.heavyAdd != null
          ? `<br><small class="muted">Heavy condition +$${formatRate(s.heavyAdd)}/${escapeHtml(s.unit)}</small>`
          : ""
      }</td>
      <td>${escapeHtml(s.unit)}</td>
      <td class="sheet-range">${escapeHtml(rangeLabel(s))}</td>
      <td><input type="number" min="0" step="0.01" data-rate-id="${s.id}" value="${s.rate}" ${
        s.quotedOnSite ? 'title="Enter bid after on-site quote"' : ""
      } /></td>
    `;
    els.ratesTableBody.appendChild(tr);
  }
}

function persistSettingsFromForm() {
  settings.businessName = els.businessName.value.trim() || "AmenityWorks";
  settings.minJobFee = Math.max(0, Number(els.minJobFee.value) || 0);
  settings.multipliers = {
    light: Math.max(0.1, Number(els.multLight.value) || 1),
    medium: Math.max(0.1, Number(els.multMedium.value) || 1),
    heavy: Math.max(0.1, Number(els.multHeavy.value) || 1),
  };
  settings.catalogVersion = CATALOG_VERSION;
  els.ratesTableBody.querySelectorAll("[data-rate-id]").forEach((input) => {
    const id = input.dataset.rateId;
    const svc = settings.services.find((s) => s.id === id);
    if (svc) svc.rate = Math.max(0, Number(input.value) || 0);
  });
  saveSettings();
  applyBusinessName();
  // Refresh line rates only when still matching old default? Keep per-line overrides.
  renderServiceLines();
  recalc();
  closeSettings();
}

function resetDefaults() {
  if (
    !confirm(
      "Restore AmenityWorks price-sheet defaults (midpoints of published ranges)? Your saved rates will be replaced."
    )
  ) {
    return;
  }
  const name = settings.businessName;
  settings = structuredClone(DEFAULT_SETTINGS);
  settings.businessName = name || DEFAULT_SETTINGS.businessName;
  saveSettings();
  openSettings();
  applyBusinessName();
  renderServiceLines();
  recalc();
}

function clearJob() {
  lines = [];
  els.customerName.value = "";
  els.customerContact.value = "";
  els.jobAddress.value = "";
  els.travelFee.value = 0;
  els.discountPct.value = 0;
  els.taxPct.value = 0;
  els.quoteNotes.value = "";
  renderServiceLines();
  recalc();
  addServiceLine({ serviceId: "driveway", quantity: "", condition: "light" });
}

// ——— Events ———
document.getElementById("btnAddService").addEventListener("click", () => addServiceLine());
document.getElementById("btnSettings").addEventListener("click", openSettings);
document.getElementById("btnCloseSettings").addEventListener("click", closeSettings);
document.getElementById("btnSaveSettings").addEventListener("click", persistSettingsFromForm);
document.getElementById("btnResetDefaults").addEventListener("click", resetDefaults);
document.getElementById("btnReset").addEventListener("click", clearJob);
document.getElementById("btnCopy").addEventListener("click", copyQuote);
document.getElementById("btnPrint").addEventListener("click", printQuote);

["travelFee", "discountPct", "taxPct"].forEach((id) => {
  document.getElementById(id).addEventListener("input", recalc);
});

els.settingsModal.addEventListener("click", (e) => {
  if (e.target === els.settingsModal) closeSettings();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !els.settingsModal.hidden) closeSettings();
});

// ——— Init ———
applyBusinessName();
addServiceLine({ serviceId: "driveway", quantity: "", condition: "light" });
recalc();
