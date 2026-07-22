/**
 * AmenityWorks Junk Haul Pricer
 * Customer rates: one-off res · one-off commercial · recurring + true cost floor
 */

const STORAGE_KEY = "junkHaulPricer.v2";

const LOAD_KEYS = [
  { id: "min", label: "Minimum (1–2 small items)" },
  { id: "eighth", label: "⅛ trailer" },
  { id: "quarter", label: "¼ trailer" },
  { id: "third", label: "⅓ trailer" },
  { id: "half", label: "½ trailer" },
  { id: "three_quarter", label: "¾ trailer" },
  { id: "full", label: "Full trailer" },
];

/** Round up commercial (~15% over residential one-off) to a clean dollar */
function comFromRes(n) {
  return Math.ceil((n * 1.15) / 5) * 5;
}

/** Default volume rates */
const DEFAULT_VOLUME = {
  min: { oneoff: 95, commercial: 125, recurring: 75 },
  eighth: { oneoff: 150, commercial: 175, recurring: 120 },
  quarter: { oneoff: 200, commercial: 250, recurring: 160 },
  third: { oneoff: 250, commercial: 300, recurring: 200 },
  half: { oneoff: 300, commercial: 350, recurring: 240 },
  three_quarter: { oneoff: 450, commercial: 525, recurring: 360 },
  full: { oneoff: 600, commercial: 700, recurring: 480 },
};

/** Default per-item — residential midpoints; commercial ~15% up; recurring ~20% off res */
const DEFAULT_ITEMS = [
  { id: "chair", name: "Chair", cat: "Furniture", oneoff: 45, commercial: 55, recurring: 36 },
  { id: "recliner", name: "Recliner", cat: "Furniture", oneoff: 65, commercial: 75, recurring: 52 },
  { id: "sofa", name: "Sofa / loveseat", cat: "Furniture", oneoff: 95, commercial: 110, recurring: 76 },
  { id: "sectional", name: "Sectional", cat: "Furniture", oneoff: 175, commercial: 200, recurring: 140 },
  { id: "mattress", name: "Mattress or box spring", cat: "Furniture", oneoff: 75, commercial: 90, recurring: 60 },
  { id: "bedframe", name: "Bed frame", cat: "Furniture", oneoff: 35, commercial: 40, recurring: 28 },
  { id: "dining", name: "Dining table", cat: "Furniture", oneoff: 75, commercial: 90, recurring: 60 },
  { id: "minifridge", name: "Mini fridge", cat: "Appliances", oneoff: 50, commercial: 60, recurring: 40 },
  { id: "fridge", name: "Full-size fridge", cat: "Appliances", oneoff: 85, commercial: 100, recurring: 68 },
  { id: "washer", name: "Washer or dryer", cat: "Appliances", oneoff: 75, commercial: 90, recurring: 60 },
  { id: "waterheater", name: "Water heater", cat: "Appliances", oneoff: 75, commercial: 90, recurring: 60 },
  { id: "microwave", name: "Microwave", cat: "Appliances", oneoff: 25, commercial: 30, recurring: 20 },
  { id: "tv_small", name: "TV under 40\"", cat: "Electronics", oneoff: 40, commercial: 50, recurring: 32 },
  { id: "tv_large", name: "Large TV", cat: "Electronics", oneoff: 75, commercial: 90, recurring: 60 },
  { id: "entcenter", name: "Entertainment center", cat: "Electronics", oneoff: 95, commercial: 110, recurring: 76 },
  { id: "bbq", name: "BBQ grill", cat: "Outdoor", oneoff: 65, commercial: 75, recurring: 52 },
  { id: "patio", name: "Patio set", cat: "Outdoor", oneoff: 120, commercial: 140, recurring: 96 },
  { id: "mower", name: "Lawn mower", cat: "Outdoor", oneoff: 70, commercial: 80, recurring: 56 },
];

const DEFAULT_STATE = {
  jobName: "",
  jobType: "oneoff",
  priceMode: "hybrid",
  loadSize: "quarter",
  miles: 20,
  laborHours: 1.5,
  dumpFees: 45,
  stairsFloors: 0,
  stairsPerFloor: 30,
  heavyCount: 0,
  heavyEach: 75,
  longCarryCount: 0,
  longCarryEach: 25,
  breakdownCount: 0,
  breakdownEach: 50,
  mattressDumpFee: 20,
  paintGallons: 0,
  paintPerGallon: 7.5,
  hazmatFee: 0,
  rush: false,
  afterHours: false,
  minFeeOneOff: 95,
  minFeeCommercial: 125,
  minFeeRecurring: 75,
  laborCostRate: 25,
  mileCost: 0.35,
  leadCost: 0,
  leadMult: 3,
  truckDayCost: 125,
  truckDays: 0.5,
  targetMarginOneOff: 50,
  targetMarginCommercial: 55,
  targetMarginRecurring: 35,
  overheadFlat: 15,
  volume: structuredClone(DEFAULT_VOLUME),
  items: structuredClone(DEFAULT_ITEMS),
  itemQtys: {},
};

function $(id) {
  return document.getElementById(id);
}

function money(n) {
  return Math.round(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function isRecurring(jobType) {
  return jobType === "recurring_res" || jobType === "recurring_com";
}

function isCommercialOneOff(jobType) {
  return jobType === "oneoff_com";
}

/** Map job type → rate card column */
function rateKey(jobType) {
  if (isRecurring(jobType)) return "recurring";
  if (isCommercialOneOff(jobType)) return "commercial";
  return "oneoff";
}

function minFeeFor(s, rk) {
  if (rk === "recurring") return s.minFeeRecurring;
  if (rk === "commercial") return s.minFeeCommercial;
  return s.minFeeOneOff;
}

function targetMarginFor(s) {
  if (isRecurring(s.jobType)) return s.targetMarginRecurring / 100;
  if (isCommercialOneOff(s.jobType)) return s.targetMarginCommercial / 100;
  return s.targetMarginOneOff / 100;
}

function jobTypeLabel(jobType) {
  return (
    {
      oneoff: "one-time residential",
      oneoff_com: "one-time commercial",
      recurring_res: "recurring residential",
      recurring_com: "recurring commercial / property",
    }[jobType] || jobType
  );
}

function rateBandLabel(jobType) {
  if (isRecurring(jobType)) return "Recurring";
  if (isCommercialOneOff(jobType)) return "One-off commercial";
  return "One-off residential";
}

/** Ensure saved volume/item rows have commercial rates */
function ensureCommercialRates(volume, items) {
  const vol = {};
  for (const key of Object.keys(DEFAULT_VOLUME)) {
    const v = { ...DEFAULT_VOLUME[key], ...(volume && volume[key] ? volume[key] : {}) };
    if (v.commercial == null || v.commercial === "") {
      v.commercial = comFromRes(v.oneoff || 0);
    }
    vol[key] = v;
  }
  const itemList = mergeItems(items).map((item) => {
    if (item.commercial == null || item.commercial === "") {
      item.commercial = comFromRes(item.oneoff || 0);
    }
    return item;
  });
  return { volume: vol, items: itemList };
}

/* ---------- state ---------- */

let state = loadState();

function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // Migrate v1 saves if present
    if (!raw) raw = localStorage.getItem("junkHaulPricer.v1");
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    const fixed = ensureCommercialRates(parsed.volume, parsed.items);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      volume: fixed.volume,
      items: fixed.items,
      itemQtys: parsed.itemQtys || {},
      minFeeCommercial: parsed.minFeeCommercial ?? DEFAULT_STATE.minFeeCommercial,
      targetMarginCommercial:
        parsed.targetMarginCommercial ?? DEFAULT_STATE.targetMarginCommercial,
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function mergeItems(saved) {
  if (!Array.isArray(saved) || !saved.length) return structuredClone(DEFAULT_ITEMS);
  // Keep saved prices; ensure all default ids exist
  const map = Object.fromEntries(saved.map((i) => [i.id, i]));
  return DEFAULT_ITEMS.map((d) => ({ ...d, ...(map[d.id] || {}) }));
}

function saveState() {
  // Sync from DOM first
  readJobForm();
  readCostForm();
  readMinFees();
  readVolumeTable();
  readItemRateTable();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  toast("Defaults saved in this browser");
}

/* ---------- tabs ---------- */

function initTabs() {
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      $(`panel-${btn.dataset.tab}`).classList.add("active");
    });
  });
}

/* ---------- rate tables ---------- */

function renderVolumeTable() {
  const tbody = $("volumeTable").querySelector("tbody");
  tbody.innerHTML = "";
  for (const row of LOAD_KEYS) {
    const v = state.volume[row.id] || { oneoff: 0, commercial: 0, recurring: 0 };
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.label}</td>
      <td><input type="number" data-vol="${row.id}" data-kind="oneoff" value="${v.oneoff}" min="0" step="1" /></td>
      <td><input type="number" data-vol="${row.id}" data-kind="commercial" value="${v.commercial}" min="0" step="1" /></td>
      <td><input type="number" data-vol="${row.id}" data-kind="recurring" value="${v.recurring}" min="0" step="1" /></td>
    `;
    tbody.appendChild(tr);
  }
  tbody.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("input", () => {
      readVolumeTable();
      recalc();
    });
  });
}

function readVolumeTable() {
  document.querySelectorAll("[data-vol]").forEach((inp) => {
    const id = inp.dataset.vol;
    const kind = inp.dataset.kind;
    if (!state.volume[id]) state.volume[id] = { oneoff: 0, commercial: 0, recurring: 0 };
    state.volume[id][kind] = parseFloat(inp.value) || 0;
  });
}

function renderItemRateTable() {
  const tbody = $("itemRateTable").querySelector("tbody");
  tbody.innerHTML = "";
  for (const item of state.items) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.cat)}</td>
      <td><input type="number" data-item="${item.id}" data-kind="oneoff" value="${item.oneoff}" min="0" step="1" /></td>
      <td><input type="number" data-item="${item.id}" data-kind="commercial" value="${item.commercial}" min="0" step="1" /></td>
      <td><input type="number" data-item="${item.id}" data-kind="recurring" value="${item.recurring}" min="0" step="1" /></td>
    `;
    tbody.appendChild(tr);
  }
  tbody.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("input", () => {
      readItemRateTable();
      renderItemGrid();
      recalc();
    });
  });
}

function readItemRateTable() {
  document.querySelectorAll("[data-item]").forEach((inp) => {
    const id = inp.dataset.item;
    const kind = inp.dataset.kind;
    const item = state.items.find((i) => i.id === id);
    if (item) item[kind] = parseFloat(inp.value) || 0;
  });
}

function renderItemGrid() {
  const grid = $("itemGrid");
  const rk = rateKey(state.jobType || $("jobType")?.value || "oneoff");
  // Preserve qty from inputs if present
  const prev = {};
  grid.querySelectorAll("[data-qty]").forEach((inp) => {
    prev[inp.dataset.qty] = parseInt(inp.value, 10) || 0;
  });

  grid.innerHTML = "";
  for (const item of state.items) {
    const qty = prev[item.id] ?? state.itemQtys[item.id] ?? 0;
    const price = item[rk];
    const div = document.createElement("div");
    div.className = "item-chip";
    div.innerHTML = `
      <label for="qty-${item.id}">${escapeHtml(item.name)}</label>
      <span class="price-tag">${money(price)}</span>
      <input type="number" id="qty-${item.id}" data-qty="${item.id}" min="0" step="1" value="${qty}" title="Quantity" />
    `;
    grid.appendChild(div);
  }
  grid.querySelectorAll("[data-qty]").forEach((inp) => {
    inp.addEventListener("input", () => {
      state.itemQtys[inp.dataset.qty] = parseInt(inp.value, 10) || 0;
      recalc();
    });
  });
}

/* ---------- form sync ---------- */

function writeJobForm() {
  $("jobName").value = state.jobName || "";
  $("jobType").value = state.jobType;
  $("priceMode").value = state.priceMode;
  $("loadSize").value = state.loadSize;
  $("miles").value = state.miles;
  $("laborHours").value = state.laborHours;
  $("dumpFees").value = state.dumpFees;
  $("stairsFloors").value = state.stairsFloors;
  $("stairsPerFloor").value = state.stairsPerFloor;
  $("heavyCount").value = state.heavyCount;
  $("heavyEach").value = state.heavyEach;
  $("longCarryCount").value = state.longCarryCount;
  $("longCarryEach").value = state.longCarryEach;
  $("breakdownCount").value = state.breakdownCount;
  $("breakdownEach").value = state.breakdownEach;
  if ($("mattressDumpFee")) $("mattressDumpFee").value = state.mattressDumpFee;
  if ($("paintGallons")) $("paintGallons").value = state.paintGallons;
  if ($("paintPerGallon")) $("paintPerGallon").value = state.paintPerGallon;
  if ($("hazmatFee")) $("hazmatFee").value = state.hazmatFee;
  if ($("hazmatPreset")) {
    const p = $("hazmatPreset");
    const match = ["0", "15", "25", "40", "60"].includes(String(state.hazmatFee))
      ? String(state.hazmatFee)
      : "0";
    p.value = match;
  }
  $("rush").checked = state.rush;
  $("afterHours").checked = state.afterHours;
  if ($("mattressFeeLabel")) $("mattressFeeLabel").textContent = state.mattressDumpFee;
  if ($("paintFeeLabel")) $("paintFeeLabel").textContent = formatFee(state.paintPerGallon);
}

function formatFee(n) {
  const x = Number(n) || 0;
  return x % 1 === 0 ? String(x) : x.toFixed(2);
}

function readJobForm() {
  state.jobName = $("jobName").value;
  state.jobType = $("jobType").value;
  state.priceMode = $("priceMode").value;
  state.loadSize = $("loadSize").value;
  state.miles = num("miles");
  state.laborHours = num("laborHours");
  state.dumpFees = num("dumpFees");
  state.stairsFloors = num("stairsFloors");
  state.stairsPerFloor = num("stairsPerFloor");
  state.heavyCount = num("heavyCount");
  state.heavyEach = num("heavyEach");
  state.longCarryCount = num("longCarryCount");
  state.longCarryEach = num("longCarryEach");
  state.breakdownCount = num("breakdownCount");
  state.breakdownEach = num("breakdownEach");
  if ($("mattressDumpFee")) state.mattressDumpFee = num("mattressDumpFee");
  if ($("paintGallons")) state.paintGallons = num("paintGallons");
  if ($("paintPerGallon")) state.paintPerGallon = num("paintPerGallon");
  if ($("hazmatFee")) state.hazmatFee = num("hazmatFee");
  state.rush = $("rush").checked;
  state.afterHours = $("afterHours").checked;
  if ($("mattressFeeLabel") && $("mattressDumpFee")) {
    $("mattressFeeLabel").textContent = state.mattressDumpFee;
  }
  if ($("paintFeeLabel")) $("paintFeeLabel").textContent = formatFee(state.paintPerGallon);
}

/** Mattress / box spring qty from Items section only */
function mattressQtyFromItems(s) {
  return Math.max(0, parseInt(s.itemQtys.mattress, 10) || 0);
}

function writeCostForm() {
  $("laborCostRate").value = state.laborCostRate;
  $("mileCost").value = state.mileCost;
  $("leadCost").value = state.leadCost;
  $("leadMult").value = state.leadMult;
  $("truckDayCost").value = state.truckDayCost;
  $("truckDays").value = state.truckDays;
  $("targetMarginOneOff").value = state.targetMarginOneOff;
  if ($("targetMarginCommercial"))
    $("targetMarginCommercial").value = state.targetMarginCommercial;
  $("targetMarginRecurring").value = state.targetMarginRecurring;
  $("overheadFlat").value = state.overheadFlat;
  if ($("mattressDumpFee")) $("mattressDumpFee").value = state.mattressDumpFee;
  if ($("mattressFeeLabel")) $("mattressFeeLabel").textContent = state.mattressDumpFee;
  $("minFeeOneOff").value = state.minFeeOneOff;
  if ($("minFeeCommercial")) $("minFeeCommercial").value = state.minFeeCommercial;
  $("minFeeRecurring").value = state.minFeeRecurring;
}

function readCostForm() {
  state.laborCostRate = num("laborCostRate");
  state.mileCost = num("mileCost");
  state.leadCost = num("leadCost");
  state.leadMult = num("leadMult", 3);
  state.truckDayCost = num("truckDayCost");
  state.truckDays = num("truckDays");
  state.targetMarginOneOff = num("targetMarginOneOff");
  if ($("targetMarginCommercial"))
    state.targetMarginCommercial = num("targetMarginCommercial");
  state.targetMarginRecurring = num("targetMarginRecurring");
  state.overheadFlat = num("overheadFlat");
  if ($("mattressDumpFee")) state.mattressDumpFee = num("mattressDumpFee");
}

function readMinFees() {
  if ($("minFeeOneOff")) state.minFeeOneOff = num("minFeeOneOff");
  if ($("minFeeCommercial")) state.minFeeCommercial = num("minFeeCommercial");
  if ($("minFeeRecurring")) state.minFeeRecurring = num("minFeeRecurring");
}

function num(id, fallback = 0) {
  const v = parseFloat($(id).value);
  return Number.isFinite(v) ? v : fallback;
}

/* ---------- calculate ---------- */

function calcTrueCost(s) {
  const labor = s.laborHours * s.laborCostRate;
  const miles = s.miles * s.mileCost;
  const mattressCount = mattressQtyFromItems(s);
  const mattressFees = mattressCount * s.mattressDumpFee;
  const paintGals = Math.max(0, s.paintGallons || 0);
  const paintFees = paintGals > 0 ? paintGals * (s.paintPerGallon || 0) : 0;
  const hazmat = Math.max(0, s.hazmatFee || 0);
  const dump = s.dumpFees + mattressFees + paintFees;
  const lead = s.leadCost * s.leadMult;
  const truck = s.truckDayCost * s.truckDays;
  const overhead = s.overheadFlat;
  // Hazmat handling is revenue-side work; treat as cost floor only if you want margin on it —
  // include half as "extra labor risk" so underbidding hurts less: count full fee as cost of time/risk
  const floor = labor + miles + dump + lead + truck + overhead + hazmat;

  const targetPct = targetMarginFor(s);
  const costPlus =
    targetPct >= 0.99 ? floor * 10 : floor / (1 - Math.min(0.9, Math.max(0, targetPct)));

  return {
    labor,
    miles,
    dump,
    lead,
    truck,
    overhead,
    floor,
    costPlus,
    parts: [
      { label: `Labor (${s.laborHours}h × $${s.laborCostRate})`, amount: labor },
      { label: `Miles (${s.miles} × $${s.mileCost})`, amount: miles },
      { label: "Dump fees", amount: s.dumpFees },
      ...(mattressFees > 0
        ? [
            {
              label: `Mattress landfill fee (${mattressCount} × $${s.mattressDumpFee})`,
              amount: mattressFees,
            },
          ]
        : []),
      ...(paintFees > 0
        ? [
            {
              label: `Paint disposal (${paintGals} gal × $${formatFee(s.paintPerGallon)})`,
              amount: paintFees,
            },
          ]
        : []),
      ...(hazmat > 0
        ? [{ label: "Hazmat / special handling (time & risk)", amount: hazmat }]
        : []),
      { label: `Lead recovery (${s.leadMult}×)`, amount: lead },
      { label: `Trailer rental ($${s.truckDayCost}/day × ${s.truckDays} day)`, amount: truck },
      { label: "Overhead slice", amount: overhead },
    ],
  };
}

function calcCustomer(s) {
  const rk = rateKey(s.jobType);
  const vol = s.volume[s.loadSize] || { oneoff: 0, commercial: 0, recurring: 0 };
  let volumeBase = vol[rk] || 0;

  // Minimum load uses min fee for that job band
  if (s.loadSize === "min") {
    volumeBase = minFeeFor(s, rk);
  }

  // Items
  let itemsBase = 0;
  const itemLines = [];
  for (const item of s.items) {
    const qty = s.itemQtys[item.id] || 0;
    if (qty > 0) {
      const line = qty * (item[rk] || 0);
      itemsBase += line;
      itemLines.push({ label: `${item.name} × ${qty}`, amount: line });
    }
  }

  // Mode
  let base = 0;
  let modeNote = "";
  if (s.priceMode === "volume") {
    base = volumeBase;
    modeNote = "Volume pricing";
  } else if (s.priceMode === "items") {
    base = itemsBase;
    modeNote = "Per-item pricing";
    if (itemsBase === 0) {
      base = volumeBase;
      modeNote = "No items selected — using volume";
    }
  } else {
    // hybrid
    if (itemsBase === 0) {
      base = volumeBase;
      modeNote = "Hybrid: volume (no items selected)";
    } else {
      base = Math.max(volumeBase, itemsBase);
      modeNote =
        itemsBase >= volumeBase
          ? "Hybrid: items higher than volume"
          : "Hybrid: volume higher than items";
    }
  }

  // Enforce minimum
  const minFee = minFeeFor(s, rk);
  if (base < minFee) {
    base = minFee;
    modeNote += " · raised to minimum fee";
  }

  // Adders
  const stairs = s.stairsFloors * s.stairsPerFloor;
  const heavy = s.heavyCount * s.heavyEach;
  const longCarry = s.longCarryCount * s.longCarryEach;
  const breakdown = s.breakdownCount * s.breakdownEach;
  const mattressCount = mattressQtyFromItems(s);
  const mattressPass = mattressCount > 0 ? mattressCount * s.mattressDumpFee : 0;
  const paintGals = Math.max(0, s.paintGallons || 0);
  const paintPass = paintGals > 0 ? paintGals * (s.paintPerGallon || 0) : 0;
  let adders = stairs + heavy + longCarry + breakdown + mattressPass + paintPass;

  const adderLines = [];
  if (stairs) adderLines.push({ label: `Stairs (${s.stairsFloors} floor)`, amount: stairs });
  if (heavy) adderLines.push({ label: `Heavy items (${s.heavyCount})`, amount: heavy });
  if (longCarry) adderLines.push({ label: `Long carry (${s.longCarryCount})`, amount: longCarry });
  if (breakdown)
    adderLines.push({
      label: `Breakdown / demo / extraction (${s.breakdownCount} × $${s.breakdownEach})`,
      amount: breakdown,
    });
  if (mattressPass > 0)
    adderLines.push({
      label: `Mattress landfill fee (${mattressCount} × $${s.mattressDumpFee})`,
      amount: mattressPass,
    });
  if (paintPass > 0)
    adderLines.push({
      label: `Paint disposal (${paintGals} gal × $${formatFee(s.paintPerGallon)})`,
      amount: paintPass,
    });
  const hazmat = Math.max(0, s.hazmatFee || 0);
  if (hazmat > 0)
    adderLines.push({
      label: "Hazmat / special handling",
      amount: hazmat,
    });
  adders += hazmat;

  let subtotal = base + adders;

  let mult = 1;
  const multNotes = [];
  if (s.rush) {
    mult *= 1.15;
    multNotes.push("rush +15%");
  }
  if (s.afterHours) {
    mult *= 1.15;
    multNotes.push("after-hours +15%");
  }
  const recommend = Math.round(subtotal * mult);
  if (multNotes.length) modeNote += " · " + multNotes.join(", ");

  return {
    volumeBase,
    itemsBase,
    base,
    adders,
    subtotal,
    recommend,
    modeNote,
    itemLines,
    adderLines,
    minFee,
  };
}

function buildQuoteText(s, cust, cost) {
  const name = (s.jobName || "your pickup").trim();
  const typeLabel = jobTypeLabel(s.jobType);

  const loadLabel = LOAD_KEYS.find((l) => l.id === s.loadSize)?.label || s.loadSize;
  const lines = [];

  lines.push(`AmenityWorks junk removal quote — ${name}`);
  lines.push(`Job type: ${typeLabel}`);
  lines.push("");
  lines.push(`Quoted total: ${money(cust.recommend)}`);
  lines.push(`(Based on ${loadLabel}${cust.itemsBase > 0 ? " and selected items" : ""})`);
  lines.push("");
  lines.push(
    "Includes labor to remove and haul standard junk/bulk waste, and disposal of accepted non-hazardous materials."
  );
  lines.push("");

  if (cust.itemLines.length) {
    lines.push("Items:");
    for (const l of cust.itemLines) lines.push(`  • ${l.label}: ${money(l.amount)}`);
  } else {
    lines.push(`Load size: ${loadLabel}`);
  }

  // Only list adders that are already in this quote (paint, mattress, hazmat, etc.)
  if (cust.adderLines.length) {
    lines.push("");
    lines.push("Included in this total:");
    for (const l of cust.adderLines) lines.push(`  • ${l.label}: ${money(l.amount)}`);
  }

  lines.push("");
  lines.push(
    "Hazardous and special waste is extra. Paint, chemicals, solvents, oils, batteries, tires, and similar materials are not included in standard junk pricing. We charge facility disposal fees (for example paint is billed per gallon at the dump rate) plus a handling fee when extra packing, sorting, or a special drop-off is required. We may decline items we cannot legally or safely haul."
  );
  lines.push("");
  lines.push("Please have items accessible and pathways clear.");
  if (isCommercialOneOff(s.jobType)) {
    lines.push("");
    lines.push(
      "Commercial one-time rate. Certificate of insurance available on request. Payment due on completion unless Net terms are agreed in writing before the job."
    );
  }
  if (isRecurring(s.jobType)) {
    lines.push("");
    lines.push(
      "Recurring rate applies under our agreed schedule. Loads over the contracted volume are billed at the next tier or quoted before haul. Hazardous/special waste remains extra unless listed in the contract."
    );
  }
  lines.push("");
  lines.push("Serving Austin, TX & surrounding areas. Questions? Reply to this message.");

  return lines.join("\n");
}

/* ---------- render ---------- */

function recalc() {
  readJobForm();
  readCostForm();
  readMinFees();
  if ($("mattressFeeLabel")) $("mattressFeeLabel").textContent = state.mattressDumpFee;
  if ($("paintFeeLabel")) $("paintFeeLabel").textContent = formatFee(state.paintPerGallon);

  // item qtys already in state from grid
  const cost = calcTrueCost(state);
  const cust = calcCustomer(state);

  $("outVolume").textContent = money(cust.volumeBase);
  $("outItems").textContent = money(cust.itemsBase);
  $("outAdders").textContent = money(cust.adders);
  $("outFloor").textContent = money(cost.floor);
  $("outSubtotal").textContent = money(cust.subtotal);
  $("outModeNote").textContent = cust.modeNote;
  $("outRecommend").textContent = money(cust.recommend);

  const margin$ = cust.recommend - cost.floor;
  const marginPct = cust.recommend > 0 ? (margin$ / cust.recommend) * 100 : 0;
  $("outMargin").textContent = money(margin$);
  $("outMarginPct").textContent =
    margin$ < 0
      ? "⚠️ Below true cost — raise price or cut costs"
      : `${marginPct.toFixed(0)}% of charge is margin vs true costs`;

  if (margin$ < 0) {
    $("outRecNote").textContent = "Below cost floor — do not take at this price";
  } else if (cust.recommend < cost.costPlus * 0.9) {
    $("outRecNote").textContent = "OK but under your target margin — consider raising";
  } else {
    $("outRecNote").textContent = `${rateBandLabel(state.jobType)} rate card`;
  }

  if ($("outCostPlus")) {
    $("outCostPlus").textContent = money(cost.costPlus);
  }

  // Line table
  const tbody = $("lineBody");
  tbody.innerHTML = "";
  const addRow = (label, amount, cls) => {
    const tr = document.createElement("tr");
    if (cls) tr.className = cls;
    tr.innerHTML = `<td>${escapeHtml(label)}</td><td>${money(amount)}</td>`;
    tbody.appendChild(tr);
  };

  addRow(
    `Volume (${LOAD_KEYS.find((l) => l.id === state.loadSize)?.label || ""})`,
    cust.volumeBase
  );
  if (cust.itemsBase > 0) addRow("Selected items total", cust.itemsBase);
  addRow("Base used for quote", cust.base);
  for (const l of cust.adderLines) addRow(l.label, l.amount);
  if (state.rush || state.afterHours) {
    addRow("After multipliers (rush/after-hours)", cust.recommend - cust.subtotal);
  }
  addRow("Customer total", cust.recommend, "total");
  addRow("— True cost floor —", cost.floor);
  for (const p of cost.parts) {
    if (p.amount > 0) addRow(`  ${p.label}`, p.amount);
  }

  $("itemSumHint").textContent = `Selected items total: ${money(cust.itemsBase)} · Mode: ${
    state.priceMode
  } · ${rateBandLabel(state.jobType)} rates`;

  $("quoteText").value = buildQuoteText(state, cust, cost);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toast(msg) {
  const t = $("toast");
  t.hidden = false;
  t.textContent = msg;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    t.hidden = true;
  }, 2000);
}

function bind() {
  const jobIds = [
    "jobName",
    "jobType",
    "priceMode",
    "loadSize",
    "miles",
    "laborHours",
    "dumpFees",
    "stairsFloors",
    "stairsPerFloor",
    "heavyCount",
    "heavyEach",
    "longCarryCount",
    "longCarryEach",
    "breakdownCount",
    "breakdownEach",
    "paintGallons",
    "paintPerGallon",
    "hazmatFee",
    "mattressDumpFee",
    "rush",
    "afterHours",
    "laborCostRate",
    "mileCost",
    "leadCost",
    "leadMult",
    "truckDayCost",
    "truckDays",
    "targetMarginOneOff",
    "targetMarginCommercial",
    "targetMarginRecurring",
    "overheadFlat",
    "minFeeOneOff",
    "minFeeCommercial",
    "minFeeRecurring",
  ];

  for (const id of jobIds) {
    const el = $(id);
    if (!el) continue;
    el.addEventListener("input", () => {
      if (id === "jobType") {
        readJobForm();
        renderItemGrid();
      }
      recalc();
    });
    el.addEventListener("change", () => {
      if (id === "jobType") {
        readJobForm();
        renderItemGrid();
      }
      recalc();
    });
  }

  $("btnSave").addEventListener("click", saveState);
  $("btnReset").addEventListener("click", () => {
    if (confirm("Reset all rates and job fields to AmenityWorks starter defaults?")) {
      state = structuredClone(DEFAULT_STATE);
      localStorage.removeItem(STORAGE_KEY);
      writeJobForm();
      writeCostForm();
      renderVolumeTable();
      renderItemRateTable();
      renderItemGrid();
      recalc();
    }
  });
  $("btnClearItems").addEventListener("click", () => {
    state.itemQtys = {};
    renderItemGrid();
    recalc();
  });
  $("btnCopy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("quoteText").value);
      toast("Quote copied");
    } catch {
      $("quoteText").select();
      document.execCommand("copy");
      toast("Quote copied");
    }
  });
  $("btnPrint").addEventListener("click", () => window.print());

  if ($("hazmatPreset")) {
    $("hazmatPreset").addEventListener("change", () => {
      const v = parseFloat($("hazmatPreset").value);
      if (Number.isFinite(v) && v > 0) {
        $("hazmatFee").value = v;
        state.hazmatFee = v;
      } else if (v === 0 && $("hazmatPreset").value === "0") {
        // leave custom amount unless they want clear — only clear if fee matched a preset
        // don't zero out custom; user can type 0 manually
      }
      if (v > 0) recalc();
    });
  }
  if ($("hazmatFee")) {
    $("hazmatFee").addEventListener("input", () => {
      const fee = num("hazmatFee");
      if ($("hazmatPreset")) {
        $("hazmatPreset").value = ["0", "15", "25", "40", "60"].includes(String(fee))
          ? String(fee)
          : "0";
      }
    });
  }
}

function init() {
  initTabs();
  writeJobForm();
  writeCostForm();
  renderVolumeTable();
  renderItemRateTable();
  renderItemGrid();
  bind();
  recalc();
}

init();
