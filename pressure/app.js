/**
 * Pressure washing pricing calculator (Pressure Wash Pro)
 * Rates saved to localStorage; tweak under Rates to match your market.
 */

const STORAGE_KEY = "pw-pricing-settings-v1";

const DEFAULT_SERVICES = [
  { id: "house_wash", name: "House wash (soft wash)", unit: "sq ft", rate: 0.28 },
  { id: "driveway", name: "Driveway / concrete", unit: "sq ft", rate: 0.22 },
  { id: "sidewalk", name: "Sidewalk / walkway", unit: "sq ft", rate: 0.25 },
  { id: "patio_deck", name: "Patio / deck", unit: "sq ft", rate: 0.35 },
  { id: "fence", name: "Fence", unit: "linear ft", rate: 1.5 },
  { id: "roof", name: "Roof soft wash", unit: "sq ft", rate: 0.45 },
  { id: "gutter", name: "Gutter brightening", unit: "linear ft", rate: 2.0 },
  { id: "fleet", name: "Fleet / vehicle", unit: "each", rate: 45 },
  { id: "commercial", name: "Commercial lot", unit: "sq ft", rate: 0.12 },
  { id: "custom", name: "Custom / other", unit: "flat", rate: 0 },
];

const DEFAULT_SETTINGS = {
  businessName: "Pressure Wash Pro",
  minJobFee: 150,
  multipliers: { light: 1.0, medium: 1.25, heavy: 1.5 },
  services: DEFAULT_SERVICES.map((s) => ({ ...s })),
};

/** @type {typeof DEFAULT_SETTINGS} */
let settings = loadSettings();

/** @type {{ id: string, serviceId: string, quantity: number, condition: string }[]} */
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
    return {
      ...structuredClone(DEFAULT_SETTINGS),
      ...parsed,
      multipliers: { ...DEFAULT_SETTINGS.multipliers, ...(parsed.multipliers || {}) },
      services: Array.isArray(parsed.services) && parsed.services.length
        ? parsed.services
        : structuredClone(DEFAULT_SERVICES),
    };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function applyBusinessName() {
  els.businessNameDisplay.textContent = settings.businessName || "Pressure Wash Pro";
  document.title = `${settings.businessName || "Pressure Wash Pro"} · AmenityWorks`;
}

// ——— Money helpers ———
const money = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

function getService(id) {
  return settings.services.find((s) => s.id === id) || settings.services[0];
}

function conditionMult(key) {
  const m = settings.multipliers;
  if (key === "medium") return m.medium;
  if (key === "heavy") return m.heavy;
  return m.light;
}

function lineAmount(line) {
  const svc = getService(line.serviceId);
  const qty = Math.max(0, Number(line.quantity) || 0);
  const rate = Number(svc.rate) || 0;
  if (svc.unit === "flat") {
    // Flat = custom total entered in quantity field
    return qty * conditionMult(line.condition);
  }
  return qty * rate * conditionMult(line.condition);
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

function addServiceLine(preset = {}) {
  lines.push({
    id: uid(),
    serviceId: preset.serviceId || settings.services[0].id,
    quantity: preset.quantity ?? "",
    condition: preset.condition || "light",
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

    const unitLabel =
      svc.unit === "flat" ? "Amount ($)" : `Qty (${svc.unit})`;

    row.innerHTML = `
      <label class="field">
        <span>Service</span>
        <select data-field="serviceId" aria-label="Service type"></select>
      </label>
      <label class="field">
        <span>Condition</span>
        <select data-field="condition" aria-label="Soil condition">
          <option value="light">Light</option>
          <option value="medium">Medium</option>
          <option value="heavy">Heavy / mold</option>
        </select>
      </label>
      <label class="field">
        <span class="qty-label">${unitLabel}</span>
        <input type="number" data-field="quantity" min="0" step="any" placeholder="0" value="${line.quantity}" />
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
    for (const s of settings.services) {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = `${s.name} · $${Number(s.rate).toFixed(2)}/${s.unit === "flat" ? "custom" : s.unit}`;
      if (s.id === line.serviceId) opt.selected = true;
      select.appendChild(opt);
    }

    row.querySelector('[data-field="condition"]').value = line.condition;

    row.querySelector('[data-field="serviceId"]').addEventListener("change", (e) => {
      line.serviceId = e.target.value;
      const newSvc = getService(line.serviceId);
      const qtyLabel = row.querySelector(".qty-label");
      qtyLabel.textContent =
        newSvc.unit === "flat" ? "Amount ($)" : `Qty (${newSvc.unit})`;
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
            ? " · medium soil"
            : line.condition === "heavy"
              ? " · heavy soil"
              : "";
        const qtyPart =
          svc.unit === "flat"
            ? "custom"
            : `${Number(line.quantity) || 0} ${svc.unit}${cond}`;
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
          <div class="ql-label"><strong>Travel / trip fee</strong></div>
          <div class="ql-price">${money(q.travel)}</div>
        </div>`;
    }
  }

  // Refresh line totals in form
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
  const biz = settings.businessName || "Pressure Wash Pro";

  const linesText = q.serviceItems
    .map(({ line, svc, amount }) => {
      const qty =
        svc.unit === "flat"
          ? "custom"
          : `${Number(line.quantity) || 0} ${svc.unit}`;
      const cond = line.condition !== "light" ? ` (${line.condition})` : "";
      return `  • ${svc.name}: ${qty}${cond} — ${money(amount)}`;
    })
    .join("\n");

  let text = `${biz} — Quote\n`;
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
    // Fallback
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
  const biz = settings.businessName || "Pressure Wash Pro";

  const rows = q.serviceItems
    .map(({ line, svc, amount }) => {
      const qty =
        svc.unit === "flat"
          ? "Custom"
          : `${Number(line.quantity) || 0} ${svc.unit}${line.condition !== "light" ? ` · ${line.condition}` : ""}`;
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
      Quote · ${new Date().toLocaleDateString()}<br>
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
  for (const s of settings.services) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.unit)}</td>
      <td><input type="number" min="0" step="0.01" data-rate-id="${s.id}" value="${s.rate}" /></td>
    `;
    els.ratesTableBody.appendChild(tr);
  }
}

function persistSettingsFromForm() {
  settings.businessName = els.businessName.value.trim() || "Pressure Wash Pro";
  settings.minJobFee = Math.max(0, Number(els.minJobFee.value) || 0);
  settings.multipliers = {
    light: Math.max(0.1, Number(els.multLight.value) || 1),
    medium: Math.max(0.1, Number(els.multMedium.value) || 1.25),
    heavy: Math.max(0.1, Number(els.multHeavy.value) || 1.5),
  };
  els.ratesTableBody.querySelectorAll("[data-rate-id]").forEach((input) => {
    const id = input.dataset.rateId;
    const svc = settings.services.find((s) => s.id === id);
    if (svc) svc.rate = Math.max(0, Number(input.value) || 0);
  });
  saveSettings();
  applyBusinessName();
  renderServiceLines();
  recalc();
  closeSettings();
}

function resetDefaults() {
  if (!confirm("Restore default rates and multipliers? Your saved rates will be replaced.")) {
    return;
  }
  settings = structuredClone(DEFAULT_SETTINGS);
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
  addServiceLine();
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
