/**
 * Demo Job Pricer
 * Cost build-up: labor + disposal + misc + footings → contingency → margin
 * Hours are estimated from job factors; all rates are user-editable.
 */

const STORAGE_KEY = "demoJobPricer.v1";

const DEFAULTS = {
  jobName: "",
  sqft: 273,
  height: "raised",
  access: "typical",
  crew: "solo",
  hotTub: true,
  haulAway: true,
  footings: false,
  familyJob: false,
  footingCount: 0,
  laborRate: 70,
  helperCost: 0,
  trailerDayRate: 125,
  trailerDaysOverride: "",
  dumpFees: 250,
  fuel: 80,
  misc: 75,
  hoursOverride: "",
  contingencyPct: 15,
  marginPct: 28,
  familyDiscountPct: 18,
  footingEach: 100,
};

const IDS = Object.keys(DEFAULTS);

function $(id) {
  return document.getElementById(id);
}

function money(n) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function moneyExact(n) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function num(id, fallback = 0) {
  const el = $(id);
  if (!el) return fallback;
  const v = parseFloat(el.value);
  return Number.isFinite(v) ? v : fallback;
}

function str(id) {
  return $(id)?.value ?? "";
}

function checked(id) {
  return Boolean($(id)?.checked);
}

function readForm() {
  return {
    jobName: str("jobName"),
    sqft: num("sqft", 0),
    height: str("height"),
    access: str("access"),
    crew: str("crew"),
    hotTub: checked("hotTub"),
    haulAway: checked("haulAway"),
    footings: checked("footings"),
    familyJob: checked("familyJob"),
    footingCount: num("footingCount", 0),
    laborRate: num("laborRate", 70),
    helperCost: num("helperCost", 0),
    trailerDayRate: num("trailerDayRate", 125),
    trailerDaysOverride: str("trailerDaysOverride").trim(),
    dumpFees: num("dumpFees", 0),
    fuel: num("fuel", 0),
    misc: num("misc", 0),
    hoursOverride: str("hoursOverride").trim(),
    contingencyPct: num("contingencyPct", 15),
    marginPct: num("marginPct", 28),
    familyDiscountPct: num("familyDiscountPct", 18),
    footingEach: num("footingEach", 100),
  };
}

function writeForm(data) {
  for (const key of IDS) {
    const el = $(key);
    if (!el) continue;
    const val = data[key] ?? DEFAULTS[key];
    if (el.type === "checkbox") {
      el.checked = Boolean(val);
    } else {
      el.value = val === "" || val === null || val === undefined ? "" : val;
    }
  }
  syncFootingVisibility();
}

/** Estimate labor hours from job factors (editable via override). */
function estimateHours(f) {
  if (f.hoursOverride !== "") {
    const o = parseFloat(f.hoursOverride);
    if (Number.isFinite(o) && o >= 0) return { hours: o, auto: false };
  }

  // Base: ~0.045–0.055 hr/sqft for boards+framing+cleanup solo ground
  let hours = Math.max(4, f.sqft * 0.05);

  // Height multipliers
  const heightMult = { ground: 1, raised: 1.3, second: 1.55 };
  hours *= heightMult[f.height] ?? 1.3;

  // Access
  const accessMult = { easy: 0.9, typical: 1, hard: 1.3 };
  hours *= accessMult[f.access] ?? 1;

  // Hot tub
  if (f.hotTub) {
    hours += f.height === "ground" ? 3.5 : 5;
  }

  // Footings (time); dollar cost is separate
  if (f.footings && f.footingCount > 0) {
    hours += f.footingCount * 0.75;
  }

  // Haul / load time
  if (f.haulAway) {
    hours += 3 + Math.min(4, f.sqft / 120);
  } else {
    hours += 0.5; // stack only
  }

  // Crew: helper reduces *your* hours and total job clock somewhat
  // We bill YOUR hours + helper as separate $; estimate total person-hours then adjust
  if (f.crew === "helper") {
    // Two people: wall-clock ~60% of solo, your personal hours similar fraction of work
    hours *= 0.62;
  }

  // Round to 0.5
  hours = Math.round(hours * 2) / 2;
  return { hours, auto: true };
}

function estimateTrailerDays(f, hours) {
  if (f.trailerDaysOverride !== "") {
    const o = parseFloat(f.trailerDaysOverride);
    if (Number.isFinite(o) && o >= 0) return { days: o, auto: false };
  }
  if (!f.haulAway) return { days: 0, auto: true };

  // Rough: ~1 day per ~10–12 labor hours of haul-heavy work, min 1
  let days = Math.max(1, Math.ceil(hours / 10));
  if (f.hotTub) days = Math.max(days, f.crew === "solo" ? 2 : 1);
  if (f.crew === "helper") days = Math.max(1, days - 1);
  if (f.sqft > 400) days += 1;
  return { days, auto: true };
}

function calculate(f) {
  const { hours, auto: hoursAuto } = estimateHours(f);
  const { days: trailerDays, auto: trailerAuto } = estimateTrailerDays(f, hours);

  const laborCost = hours * f.laborRate;
  const helperCost = f.crew === "helper" ? f.helperCost : f.helperCost > 0 ? f.helperCost : 0;
  // If crew is solo, still allow helperCost if user typed it (optional day help)
  const helperLine = f.helperCost > 0 ? f.helperCost : 0;

  const trailerCost = f.haulAway ? trailerDays * f.trailerDayRate : 0;
  const dumpFees = f.haulAway ? f.dumpFees : 0;
  const fuel = f.haulAway ? f.fuel : Math.min(f.fuel, 20);
  const misc = f.misc;
  const footingCost =
    f.footings && f.footingCount > 0 ? f.footingCount * f.footingEach : 0;

  const lines = [
    { label: `Labor (${hours} hrs × ${moneyExact(f.laborRate)}/hr)`, amount: laborCost },
  ];
  if (helperLine > 0) {
    lines.push({ label: "Helper", amount: helperLine });
  }
  if (trailerCost > 0) {
    lines.push({
      label: `Trailer / dumpster (${trailerDays} day${trailerDays === 1 ? "" : "s"} × ${moneyExact(f.trailerDayRate)})`,
      amount: trailerCost,
    });
  }
  if (dumpFees > 0) lines.push({ label: "Dump / landfill fees", amount: dumpFees });
  if (fuel > 0) lines.push({ label: "Fuel", amount: fuel });
  if (misc > 0) lines.push({ label: "Misc / blades / PPE", amount: misc });
  if (footingCost > 0) {
    lines.push({
      label: `Footings (${f.footingCount} × ${moneyExact(f.footingEach)})`,
      amount: footingCost,
    });
  }
  if (!f.haulAway) {
    lines.push({ label: "Haul-away (not included)", amount: 0 });
  }

  const direct = lines.reduce((s, l) => s + l.amount, 0);
  const contingency = direct * (f.contingencyPct / 100);
  const afterCont = direct + contingency;
  const margin = afterCont * (f.marginPct / 100);
  const market = afterCont + margin;
  const family = market * (1 - f.familyDiscountPct / 100);
  const floor = afterCont;

  // Recommended
  let recommend = f.familyJob ? family : market;
  let recommendNote = f.familyJob
    ? "Family job checked — discounted ask"
    : "Market ask for this job";

  // Soft floor guard: never recommend below floor
  if (recommend < floor) {
    recommend = floor;
    recommendNote = "Clamped to floor (would have been below cost)";
  }

  // Range: ±8% around recommend, but not under floor
  const rangeLow = Math.max(floor, recommend * 0.92);
  const rangeHigh = recommend * 1.1;

  const perSqft = f.sqft > 0 ? recommend / f.sqft : 0;

  const assumptions = buildAssumptions(f, {
    hours,
    hoursAuto,
    trailerDays,
    trailerAuto,
  });

  return {
    hours,
    hoursAuto,
    trailerDays,
    trailerAuto,
    lines,
    direct,
    contingency,
    afterCont,
    floor,
    market,
    family,
    recommend,
    recommendNote,
    rangeLow,
    rangeHigh,
    perSqft,
    assumptions,
  };
}

function buildAssumptions(f, meta) {
  const heightLabel = { ground: "ground level", raised: "raised", second: "2nd story / high" };
  const accessLabel = { easy: "easy", typical: "typical", hard: "hard" };
  const list = [];

  list.push(
    meta.hoursAuto
      ? `Labor hours auto-estimated at ${meta.hours} hrs from sq ft, height, access, tub, haul, crew.`
      : `Labor hours manually set to ${meta.hours} hrs.`
  );
  list.push(
    meta.trailerAuto
      ? `Trailer days auto-estimated at ${meta.trailerDays}.`
      : `Trailer days manually set to ${meta.trailerDays}.`
  );
  list.push(`Height: ${heightLabel[f.height] || f.height}; access: ${accessLabel[f.access] || f.access}; crew: ${f.crew}.`);
  if (f.hotTub) list.push("Hot tub removal included in hours and scope text.");
  if (!f.haulAway) list.push("Haul-away off — customer keeps debris or separate hauler.");
  if (f.footings) {
    list.push(
      f.footingCount > 0
        ? `Removing ${f.footingCount} footing(s) at ${moneyExact(f.footingEach)} each (plus labor time).`
        : "Footings checked but count is 0 — set footing count."
    );
  } else {
    list.push("Concrete footings/piers left in place unless added.");
  }
  list.push(
    `Contingency ${f.contingencyPct}% on direct costs; market margin ${f.marginPct}% after contingency.`
  );
  if (f.familyJob) {
    list.push(`Family discount ${f.familyDiscountPct}% off market price.`);
  }
  list.push("Verify dump fees and trailer days with your local yard before locking a quote.");

  return list;
}

function buildQuoteText(f, r) {
  const name = f.jobName.trim() || "your project";
  const price = f.familyJob ? r.recommend : r.recommend;
  const priceLabel = f.familyJob ? "family price" : "price";

  const parts = [];
  parts.push(
    `Quote for ${name}: approximately ${f.sqft} sq ft ${f.height === "ground" ? "ground-level" : f.height === "second" ? "elevated/2nd-story" : "raised"} structure` +
      (f.hotTub ? " with hot tub removal" : "") +
      "."
  );

  if (f.familyJob) {
    parts.push(
      `A typical market job like this would be about ${moneyExact(r.market)}. For family I’m quoting ${moneyExact(price)} all-in (${priceLabel}).`
    );
  } else {
    parts.push(`All-in ${priceLabel}: ${moneyExact(price)}.`);
    parts.push(`Suggested range: ${moneyExact(r.rangeLow)} – ${moneyExact(r.rangeHigh)}.`);
  }

  parts.push("");
  parts.push("Includes:");
  parts.push(`- Tear-down of structure (~${f.sqft} sq ft)`);
  if (f.hotTub) parts.push("- Hot tub removal (drained by owner before start; cut/section as needed)");
  if (f.haulAway) parts.push("- Load-out, trailer, and disposal");
  parts.push("- Broom/rake-clean of immediate work area");
  if (f.footings && f.footingCount > 0) {
    parts.push(`- Removal of ${f.footingCount} footing(s)/pier(s)`);
  }

  parts.push("");
  parts.push("Owner before start:");
  parts.push("- Power to hot tub / work area disconnected and safe (licensed electrician if needed)");
  if (f.hotTub) parts.push("- Hot tub drained; clear access path");
  parts.push("- Gate/driveway access for trailer as agreed");

  parts.push("");
  parts.push("Not included unless added:");
  if (!f.footings || f.footingCount === 0) {
    parts.push("- Concrete footing/pier removal");
  }
  parts.push("- House repairs, ledger flashing, grading/fill, permits");
  parts.push("- Electrical or gas disconnect by me");

  parts.push("");
  parts.push(
    `Estimated effort: ~${r.hours} labor hours` +
      (f.crew === "helper" || f.helperCost > 0 ? " (with help)" : " (solo)") +
      (f.haulAway ? `; ~${r.trailerDays} trailer day(s).` : ".")
  );
  parts.push("Happy to adjust after a quick look at access and underside.");

  return parts.join("\n");
}

function render(f, r) {
  $("outHours").textContent = `${r.hours}${r.hoursAuto ? "" : " (set)"}`;
  $("outTrailerDays").textContent = f.haulAway
    ? `${r.trailerDays}${r.trailerAuto ? "" : " (set)"}`
    : "0";
  $("outDirect").textContent = money(r.direct);
  $("outAfterCont").textContent = money(r.afterCont);

  $("outFloor").textContent = money(r.floor);
  $("outMarket").textContent = money(r.market);
  $("outFamily").textContent = money(r.family);
  $("outRecommend").textContent = money(r.recommend);
  $("outRecommendNote").textContent = r.recommendNote;

  $("outRange").textContent = `${money(r.rangeLow)} – ${money(r.rangeHigh)}`;
  $("outPerSqft").textContent =
    f.sqft > 0 ? `${moneyExact(r.perSqft)}/sq ft at recommended` : "";

  const tbody = $("lineTable").querySelector("tbody");
  tbody.innerHTML = "";
  for (const line of r.lines) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(line.label)}</td><td>${money(line.amount)}</td>`;
    tbody.appendChild(tr);
  }
  const trC = document.createElement("tr");
  trC.innerHTML = `<td>Contingency (${f.contingencyPct}%)</td><td>${money(r.contingency)}</td>`;
  tbody.appendChild(trC);
  const trT = document.createElement("tr");
  trT.className = "total";
  trT.innerHTML = `<td>Floor (direct + contingency)</td><td>${money(r.floor)}</td>`;
  tbody.appendChild(trT);

  const ul = $("assumptions");
  ul.innerHTML = "";
  for (const a of r.assumptions) {
    const li = document.createElement("li");
    li.textContent = a;
    ul.appendChild(li);
  }

  $("quoteText").value = buildQuoteText(f, r);

  // Dim family row styling emphasis
  const famRow = $("familyRow");
  if (f.familyJob) {
    famRow.style.opacity = "1";
    famRow.style.outline = "1px solid #3ecf8e55";
  } else {
    famRow.style.opacity = "0.85";
    famRow.style.outline = "none";
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function syncFootingVisibility() {
  const wrap = $("footingCountWrap");
  const on = checked("footings");
  wrap.hidden = !on;
}

function recalc() {
  syncFootingVisibility();
  const f = readForm();
  const r = calculate(f);
  render(f, r);
}

function saveDefaults() {
  const f = readForm();
  // Persist rates & toggles that are "yours", keep last job shape too
  localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
  showToast("Defaults saved in this browser");
}

function loadDefaults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function showToast(msg) {
  const t = $("toast");
  t.hidden = false;
  t.textContent = msg;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    t.hidden = true;
  }, 2000);
}

function bind() {
  for (const key of IDS) {
    const el = $(key);
    if (!el) continue;
    el.addEventListener("input", recalc);
    el.addEventListener("change", recalc);
  }

  $("btnSave").addEventListener("click", saveDefaults);
  $("btnReset").addEventListener("click", () => {
    if (confirm("Reset all fields to starter defaults?")) {
      writeForm(DEFAULTS);
      recalc();
    }
  });
  $("btnCopy").addEventListener("click", async () => {
    const text = $("quoteText").value;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Quote copied");
    } catch {
      $("quoteText").select();
      document.execCommand("copy");
      showToast("Quote copied");
    }
  });
  $("btnPrint").addEventListener("click", () => window.print());
}

function init() {
  const saved = loadDefaults();
  writeForm(saved ? { ...DEFAULTS, ...saved } : DEFAULTS);
  // Seed current BIL-style example if no save
  if (!saved) {
    writeForm({
      ...DEFAULTS,
      jobName: "Brother-in-law – raised deck + tub",
      familyJob: true,
    });
  }
  bind();
  recalc();
}

init();
