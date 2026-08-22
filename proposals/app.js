/**
 * AmenityWorks Proposal Builder
 * Locked boilerplate + property-specific placeholders.
 * Print to PDF · copy Xero title/description.
 */

const DRAFT_KEY = "aw-proposal-draft-v1";
const SAVED_KEY = "aw-proposal-saved-v1";
const COMPANY_KEY = "aw-proposal-company-v1";

const DEFAULT_COMPANY = {
  name: "AmenityWorks LLC",
  address: "1845 W University Ave, Georgetown, TX 78628",
  phone: "(512) 966-8026",
  email: "tra@amenity-works.com",
  website: "amenity-works.com",
  validityDays: 14,
};

const SURFACES = [
  { id: "walls", label: "Exterior walls", phrase: "all exterior tenant building walls", deliverable: "exterior walls", short: "Walls" },
  { id: "balconies", label: "Balconies", phrase: "balconies", deliverable: "balconies", short: "Balconies" },
  { id: "windows", label: "Windows", phrase: "windows", deliverable: "windows", short: "Windows" },
  { id: "breezeways", label: "Breezeways", phrase: "breezeways", deliverable: "breezeways", short: "Breezeways" },
  { id: "stairwells", label: "Stairwells", phrase: "stairwells", deliverable: "stairwells (stairs and railings)", short: "Stairwells" },
  { id: "walkways", label: "Walkways", phrase: "walkways", deliverable: "walkways", short: "Walkways" },
  { id: "courtyards", label: "Courtyards", phrase: "courtyards", deliverable: "courtyards", short: "Courtyards" },
  { id: "ceilings", label: "Ceilings", phrase: "ceilings", deliverable: "ceilings", short: "Ceilings" },
];

const LINE_PRESETS = [
  { id: "walls", name: "AmenityWorks CleanFlow - Building Surfaces | Walls", unit: "sq ft", rate: 0.25 },
  { id: "balconies", name: "AmenityWorks CleanFlow - Building Surfaces | Balconies", unit: "sq ft", rate: 0.25 },
  { id: "windows", name: "AmenityWorks CleanFlow - Building Surfaces | Windows", unit: "window", rate: 8 },
  { id: "breezeways", name: "AmenityWorks CleanFlow - Flatwork | Breezeways", unit: "sq ft", rate: 0.15 },
  { id: "stairs", name: "AmenityWorks CleanFlow - Flatwork | Stairs", unit: "sq ft", rate: 0.45 },
  { id: "walkways", name: "AmenityWorks CleanFlow - Flatwork | Walkways", unit: "sq ft", rate: 0.15 },
  { id: "courtyards", name: "AmenityWorks CleanFlow - Flatwork | Courtyards", unit: "sq ft", rate: 0.15 },
  { id: "ceilings", name: "AmenityWorks CleanFlow - Building Surfaces | Ceilings", unit: "building", rate: 125 },
  { id: "custom", name: "Custom line", unit: "flat", rate: 0 },
];

const TEMPLATES = {
  building_exteriors: {
    id: "building_exteriors",
    name: "Building exteriors",
    titleKind: "Building Exterior Soft-Wash Proposal",
    methodShort: "Soft Washing",
    hint: "Locked language matches your building-wall / balcony / window bids. Water-intrusion copy is written for painted surfaces and openings.",
    defaultSurfaces: ["walls", "balconies", "windows"],
    defaultDays: "7",
    barrierCap: 4500,
    systemContext: "multi-family properties",
    services: [
      "Soft washing",
      "Removal of dirt, cobwebs, loose debris, and organic surface contaminants",
      "Rinse and post-clean visual inspection",
    ],
    pressureAgainst: "Pressure against door/window thresholds",
    problemAreas:
      "damaged thresholds, improperly sealed door frames, window frames or existing water entry points",
  },
  breezeway_flatwork: {
    id: "breezeway_flatwork",
    name: "Breezeways & flatwork",
    titleKind: "Breezeway & Common-Area Cleaning Proposal",
    methodShort: "Pressure Washing",
    hint: "Locked language matches breezeway / stair / walkway bids (Union at San Marcos style). Barrier cap defaults to $1,500.",
    defaultSurfaces: ["breezeways", "stairwells", "walkways", "courtyards"],
    defaultDays: "1–3",
    barrierCap: 1500,
    systemContext: "multi-family breezeways",
    services: [
      "Pressure washing",
      "Soft washing",
      "Removal of dirt, cobwebs, loose debris, and surface contaminants",
      "Rinse and post-clean visual inspection",
    ],
    pressureAgainst: "Pressure against door thresholds",
    problemAreas: "damaged thresholds, improperly sealed door frames, or existing water entry points",
  },
  combined: {
    id: "combined",
    name: "Combined community clean",
    titleKind: "Community Exterior Cleaning Proposal",
    methodShort: "Pressure Washing / Soft Washing",
    hint: "Use when the bid covers both building surfaces and concrete common areas. Review surfaces, then add matching Xero line items.",
    defaultSurfaces: ["walls", "balconies", "windows", "breezeways", "stairwells", "walkways"],
    defaultDays: "7",
    barrierCap: 4500,
    systemContext: "multi-family properties",
    services: [
      "Pressure washing",
      "Soft washing",
      "Removal of dirt, cobwebs, loose debris, and organic surface contaminants",
      "Rinse and post-clean visual inspection",
    ],
    pressureAgainst: "Pressure against door/window thresholds",
    problemAreas:
      "damaged thresholds, improperly sealed door frames, window frames or existing water entry points",
  },
};

const OTHER_SERVICES = [
  "Valet Trash",
  "Window Cleaning",
  "Bulk Waste Removal",
  "Pet Waste Management",
  "Soft Washing Services",
];

const INSURANCE_LINES = [
  "General Liability",
  "Workers Compensation",
  "Umbrella",
  "Commercial Auto",
];

const SECTIONS = [
  { id: "scope", label: "Scope of services", defaultOn: true },
  { id: "services", label: "Services included", defaultOn: true },
  { id: "walkthrough", label: "Walkthrough notes", defaultOn: true },
  { id: "stains", label: "Note on stains", defaultOn: true },
  { id: "pests", label: "Pest nests", defaultOn: false },
  { id: "waterIntrusion", label: "Water intrusion prevention", defaultOn: true },
  { id: "additionalMeasures", label: "Additional measures / barriers", defaultOn: true },
  { id: "waterDamage", label: "Existing water damage observed", defaultOn: false },
  { id: "timeline", label: "Estimated timeline", defaultOn: true },
  { id: "residentImpact", label: "Resident & property impact", defaultOn: true },
  { id: "deliverables", label: "Deliverables", defaultOn: true },
  { id: "investment", label: "Investment", defaultOn: true },
  { id: "insurance", label: "Insurance", defaultOn: true },
  { id: "otherServices", label: "Other AmenityWorks services", defaultOn: true },
  { id: "acceptance", label: "Signature / acceptance", defaultOn: true },
];

function defaultSections() {
  const out = {};
  for (const s of SECTIONS) out[s.id] = s.defaultOn;
  return out;
}

function withSections(raw) {
  const sections = defaultSections();
  if (raw && raw.sections) Object.assign(sections, raw.sections);
  if (raw && raw.includeStainNote === false) sections.stains = false;
  if (raw && raw.pestNests === true) sections.pests = true;
  if (raw && raw.includeOtherServices === false) sections.otherServices = false;
  if (raw && raw.includeAcceptance === false) sections.acceptance = false;
  return { ...(raw || {}), sections };
}

function sectionOn(id) {
  return !!(state.sections && state.sections[id]);
}

function todayISO() {
  const d = new Date();
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function addDaysISO(iso, days) {
  const d = iso ? new Date(`${iso}T12:00:00`) : new Date();
  d.setDate(d.getDate() + Number(days || 0));
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function formatLongDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function money(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "$0.00";
  return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function uid() {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function joinEnglish(items) {
  const list = items.filter(Boolean);
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

function nl2br(s) {
  return esc(s).replace(/\n/g, "<br>");
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

function defaultSurfaces(ids) {
  const out = {};
  for (const s of SURFACES) out[s.id] = ids.includes(s.id);
  return out;
}

function blankState(templateId = "building_exteriors") {
  const t = TEMPLATES[templateId] || TEMPLATES.building_exteriors;
  const quoteDate = todayISO();
  const company = loadJSON(COMPANY_KEY, DEFAULT_COMPANY);
  return {
    savedId: "",
    isSample: false,
    templateId: t.id,
    propertyName: "",
    address: "",
    clientName: "",
    contactName: "",
    quoteDate,
    validUntil: addDaysISO(quoteDate, company.validityDays || 14),
    quoteNumber: "",
    surfaces: defaultSurfaces(t.defaultSurfaces),
    customSurface: "",
    coverage: "",
    scopeExtra: "",
    walkthroughNotes: "",
    waterDamageNotes: "",
    barrierCap: t.barrierCap,
    workingDays: t.defaultDays,
    extraDeliverable: "",
    sections: defaultSections(),
    lineItems: [],
  };
}

function sampleState() {
  const s = blankState("building_exteriors");
  s.isSample = true;
  s.propertyName = "Highland Commons";
  s.address = "Austin, TX";
  s.clientName = "Example Property Management";
  s.contactName = "Onsite Manager";
  s.quoteNumber = "AWQ-SAMPLE";
  s.workingDays = "7";
  s.barrierCap = 4500;
  s.lineItems = [];
  return s;
}

let company = { ...DEFAULT_COMPANY, ...loadJSON(COMPANY_KEY, {}) };
let state = withSections({ ...blankState(), ...loadJSON(DRAFT_KEY, {}) });
if (!TEMPLATES[state.templateId]) state.templateId = "building_exteriors";
if (!state.surfaces) state.surfaces = defaultSurfaces(TEMPLATES[state.templateId].defaultSurfaces);

const els = {
  editor: document.getElementById("editor"),
  workspace: document.getElementById("workspace"),
  proposal: document.getElementById("proposal"),
  xeroTitle: document.getElementById("xeroTitle"),
  xeroText: document.getElementById("xeroText"),
  surfaceChips: document.getElementById("surfaceChips"),
  lineItems: document.getElementById("lineItems"),
  sectionToggles: document.getElementById("sectionToggles"),
  templateHint: document.getElementById("templateHint"),
  savedSelect: document.getElementById("savedSelect"),
  copyStatus: document.getElementById("copyStatus"),
  settingsModal: document.getElementById("settingsModal"),
};

function template() {
  return TEMPLATES[state.templateId] || TEMPLATES.building_exteriors;
}

function selectedSurfaces() {
  const picked = SURFACES.filter((s) => state.surfaces[s.id]);
  const extra = (state.customSurface || "").trim();
  return { picked, extra };
}

function surfacePhrase() {
  const { picked, extra } = selectedSurfaces();
  const phrases = picked.map((s) => s.phrase);
  if (extra) phrases.push(extra);
  return joinEnglish(phrases) || "the designated exterior surfaces";
}

function surfaceShort() {
  const { picked, extra } = selectedSurfaces();
  const shorts = picked.map((s) => s.short);
  if (extra) shorts.push(extra);
  return shorts.join("/") || "Exterior Cleaning";
}

function coveragePhrase() {
  const custom = (state.coverage || "").trim();
  if (custom) return custom;
  const name = (state.propertyName || "").trim();
  return name ? `throughout ${name}` : "throughout the property";
}

function deliverableList() {
  const { picked, extra } = selectedSurfaces();
  const items = picked.map((s) => `Fully cleaned ${s.deliverable}`);
  if (extra) items.push(`Fully cleaned ${extra}`);
  if (!items.length) items.push("Fully cleaned exterior surfaces in the agreed scope");
  items.push("Notification of any areas needing repair or sealing");
  items.push("Before-and-after photos of heavily soiled areas");
  items.push("Final walkthrough with management if desired");
  const extraD = (state.extraDeliverable || "").trim();
  if (extraD) items.push(extraD);
  return items;
}

function lineAmount(line) {
  const qty = Number(line.qty);
  const rate = Number(line.rate);
  if (line.unit === "flat") return Number.isFinite(rate) ? rate : 0;
  if (!Number.isFinite(qty) || !Number.isFinite(rate)) return 0;
  return Math.round(qty * rate * 100) / 100;
}

function slot(value, placeholder) {
  const v = String(value ?? "").trim();
  if (!v) return `<span class="slot-empty">[${esc(placeholder)}]</span>`;
  return `<span class="slot">${esc(v)}</span>`;
}

function slotMoney(n, placeholder) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return `<span class="slot-empty">[${esc(placeholder)}]</span>`;
  return `<span class="slot">${money(v)}</span>`;
}

function logoMarkup() {
  return `<img class="mark-img" src="logo.png" width="72" height="72" alt="AmenityWorks" />`;
}

function xeroTitle() {
  const t = template();
  const property = (state.propertyName || "").trim() || "[Property name]";
  return `Project: ${surfaceShort()} ${t.methodShort} - ${property}`;
}

function xeroDescription() {
  const t = template();
  const property = (state.propertyName || "").trim();
  const surfaces = surfacePhrase();
  const coverage = coveragePhrase();
  const days = (state.workingDays || "").trim() || "[working days]";
  const cap = Number(state.barrierCap);
  const capText = Number.isFinite(cap) && cap > 0 ? money(cap) : "[barrier cap]";

  let intro = `AmenityWorks will perform a comprehensive cleaning to remove organic buildup from ${surfaces} ${coverage}. This service is designed to eliminate dirt, algae, mildew, mold, cobwebs, and other environmental contaminants, restoring a clean, professional appearance while helping preserve the integrity of the property's exterior surfaces.`;
  if (t.id === "breezeway_flatwork" && property) {
    intro = `AmenityWorks will perform a comprehensive cleaning of ${property}. This service covers ${surfaces} ${coverage} and is designed to eliminate dirt, algae, mildew, mold, cobwebs, and other environmental contaminants, restoring a clean, professional appearance while helping preserve the integrity of the property's exterior surfaces.`;
  }

  const blocks = [];

  if (sectionOn("scope")) {
    blocks.push(intro, "");
    const extra = (state.scopeExtra || "").trim();
    if (extra) blocks.push(extra, "");
  }

  if (sectionOn("services")) {
    blocks.push("Services will include:");
    for (const s of t.services) blocks.push(`-${s}`);
    blocks.push("");
  }

  const notes = (state.walkthroughNotes || "").trim();
  if (sectionOn("walkthrough") && notes) {
    blocks.push("Notes during site walkthrough:");
    blocks.push(notes);
    blocks.push("");
  }

  if (sectionOn("stains")) {
    blocks.push(
      "Note on stains: Some areas of the property contain heavy staining from long-term buildup. We will use industry-standard cleaning agents and low-pressure techniques to significantly reduce or eliminate these stains. However, certain deep or aged stains may remain slightly visible after cleaning. (If targeted stain cleaning is needed, discussions can be had and the quote/invoice price will change.)"
    );
    blocks.push("");
  }

  if (sectionOn("pests")) {
    blocks.push("Pest Nests:");
    blocks.push("Removal of pest nests require a discussion. Invoice price will change.");
    blocks.push("");
  }

  if (sectionOn("waterIntrusion")) {
    blocks.push("Water Intrusion Prevention:");
    blocks.push(
      `AmenityWorks uses a low-pressure washing system designed specifically for ${t.systemContext}. This method uses controlled water flow and evacuation reducing:`
    );
    blocks.push("-Water pooling");
    blocks.push("-Excess spray");
    blocks.push(`-${t.pressureAgainst}`);
    blocks.push("-Risk of unintended damage");
    blocks.push("");
  }

  if (sectionOn("additionalMeasures")) {
    blocks.push("Additional Measures:");
    blocks.push(`If we identify problem areas such as ${t.problemAreas} we will:`);
    blocks.push("");
    blocks.push("-Notify onsite staff immediately");
    blocks.push("-Recommend temporary water barriers to protect units");
    blocks.push("-Add barriers only if necessary and only with approval");
    blocks.push(
      `(Barriers are optional and billed as an add-on only if required and approved. Cost should not exceed ${capText} unless property has had extreme water intrusion events in the past)`
    );
    blocks.push("");
  }

  if (sectionOn("waterDamage")) {
    blocks.push("Existing Water Damage Observed:");
    const waterNotes = (state.waterDamageNotes || "").trim();
    if (waterNotes) {
      blocks.push("Observed at this property:");
      blocks.push(waterNotes);
      blocks.push("");
    }
    blocks.push("While we cannot determine the exact cause without further inspection, common contributors include:");
    blocks.push("-Failed door sweeps or weather seals");
    blocks.push("-Gaps in thresholds");
    blocks.push("-Heavy rainfall pushing water into unsealed entry points");
    blocks.push("-Previous high-pressure washing performed by other vendors");
    blocks.push("We will proceed cautiously in these areas and report any vulnerable spots before cleaning.");
    blocks.push("");
  }

  if (sectionOn("timeline")) {
    blocks.push("Estimated Timeline:");
    blocks.push(
      "Due to the size of the project and variability of soil levels across buildings, the total duration may vary slightly. To avoid giving an inaccurate timeframe, we estimate:"
    );
    blocks.push("");
    blocks.push(`~${days} working days`);
    blocks.push("");
    blocks.push("We will update management each day on progress so you always know where the team is working.");
    blocks.push("");
  }

  if (sectionOn("residentImpact")) {
    blocks.push("Resident & Property Impact:");
    blocks.push("-Work can be performed during standard daylight hours");
    blocks.push("-Safe for painted surfaces when using low pressure");
    blocks.push("-Residents will be notified to keep items away from doors and walkways");
    blocks.push("");
  }

  if (sectionOn("deliverables")) {
    blocks.push("Deliverables:");
    blocks.push("At completion, AmenityWorks will provide:");
    for (const d of deliverableList()) blocks.push(`-${d}`);
    blocks.push("");
  }

  if (sectionOn("insurance")) {
    blocks.push("Our Insurance:");
    for (const line of INSURANCE_LINES) blocks.push(`-${line}`);
  }

  return blocks.join("\n").replace(/\n{3,}/g, "\n\n");
}

function renderProposal() {
  const t = template();
  const property = (state.propertyName || "").trim();
  const lines = state.lineItems || [];
  const total = lines.reduce((sum, line) => sum + lineAmount(line), 0);

  const metaRows = [
    ["Prepared for", state.clientName || state.contactName],
    ["Onsite contact", state.contactName],
    ["Property", [property, state.address].filter(Boolean).join(" · ")],
    ["Quote date", formatLongDate(state.quoteDate)],
    ["Valid through", formatLongDate(state.validUntil)],
    ["Quote number", state.quoteNumber],
  ]
    .filter(([, v]) => String(v || "").trim())
    .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
    .join("");

  const services = t.services.map((s) => `<li>${esc(s)}</li>`).join("");
  const notes = (state.walkthroughNotes || "").trim();
  const waterNotes = (state.waterDamageNotes || "").trim();
  const extra = (state.scopeExtra || "").trim();

  const stain = sectionOn("stains")
    ? `<h2>Note on stains</h2>
      <p>Some areas of the property contain heavy staining from long-term buildup. We will use industry-standard cleaning agents and low-pressure techniques to significantly reduce or eliminate these stains. However, certain deep or aged stains may remain slightly visible after cleaning. If targeted stain cleaning is needed, discussions can be had and the quote/invoice price will change.</p>`
    : "";

  const pests = sectionOn("pests")
    ? `<h2>Pest nests</h2>
      <p>Removal of pest nests requires a discussion. Invoice price will change.</p>`
    : "";

  const investRows = lines
    .map((line) => {
      const qtyLabel =
        line.unit === "flat"
          ? "Lump sum"
          : `${Number(line.qty) || 0} ${esc(line.unit)} @ ${money(line.rate)}`;
      return `<tr>
        <td><span class="line-name">${esc(line.name || "Line item")}</span>${
          line.note ? `<span class="line-note">${esc(line.note)}</span>` : ""
        }</td>
        <td>${qtyLabel}</td>
        <td class="num">${money(lineAmount(line))}</td>
      </tr>`;
    })
    .join("");

  const invest =
    sectionOn("investment") && lines.length
      ? `<h2>Investment</h2>
      <table class="invest">
        <thead><tr><th>Description</th><th>Quantity</th><th class="num">Amount</th></tr></thead>
        <tbody>${investRows}</tbody>
        <tfoot><tr><td colspan="2">Total investment</td><td class="num">${money(total)}</td></tr></tfoot>
      </table>
      <p>This total matches the accompanying Xero quote. Alternative payment plans (phased work with payment due after each phase) are available upon approval.</p>`
      : "";

  const others = sectionOn("otherServices")
    ? `<h2>As your exterior maintenance partner, we offer</h2>
      <ul>${OTHER_SERVICES.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`
    : "";

  const sign = sectionOn("acceptance")
    ? `<h2>Acceptance</h2>
      <p>To accept this proposal, approve the accompanying Xero quote or sign below. Work will be scheduled after written approval.</p>
      <div class="sign">
        <div>
          <div class="line-space"></div>
          <label>Authorized signature · ${esc(state.clientName || "Client")}</label>
        </div>
        <div>
          <div class="line-space"></div>
          <label>Date</label>
        </div>
      </div>`
    : "";

  const scopeBlock = sectionOn("scope")
    ? `<h2>Scope of services</h2>
    <p>AmenityWorks will perform a comprehensive cleaning to remove organic buildup from ${slot(
      surfacePhrase(),
      "surfaces"
    )} ${slot(coveragePhrase(), "coverage")}. This service is designed to eliminate dirt, algae, mildew, mold, cobwebs, and other environmental contaminants, restoring a clean, professional appearance while helping preserve the integrity of the property's exterior surfaces.</p>
    ${extra ? `<p>${nl2br(extra)}</p>` : ""}`
    : "";

  const servicesBlock = sectionOn("services")
    ? `<h2>Services included</h2><ul>${services}</ul>`
    : "";

  const walkBlock =
    sectionOn("walkthrough") && notes
      ? `<h2>Notes during site walkthrough</h2><p>${nl2br(notes)}</p>`
      : "";

  const waterIntrusionBlock = sectionOn("waterIntrusion")
    ? `<h2>Water intrusion prevention</h2>
    <p>AmenityWorks uses a low-pressure washing system designed specifically for ${esc(
      t.systemContext
    )}. This method uses controlled water flow and evacuation, reducing:</p>
    <ul>
      <li>Water pooling</li>
      <li>Excess spray</li>
      <li>${esc(t.pressureAgainst)}</li>
      <li>Risk of unintended damage</li>
    </ul>`
    : "";

  const additionalBlock = sectionOn("additionalMeasures")
    ? `<h2>Additional measures</h2>
    <p>If we identify problem areas such as ${esc(t.problemAreas)} we will:</p>
    <ul>
      <li>Notify onsite staff immediately</li>
      <li>Recommend temporary water barriers to protect units</li>
      <li>Add barriers only if necessary and only with approval</li>
    </ul>
    <p>Barriers are optional and billed as an add-on only if required and approved. Cost should not exceed ${slotMoney(
      state.barrierCap,
      "barrier cap"
    )} unless the property has had extreme water intrusion events in the past.</p>`
    : "";

  const waterDamageBlock = sectionOn("waterDamage")
    ? `<h2>Existing water damage observed</h2>
    ${waterNotes ? `<p><strong>Observed at this property:</strong><br>${nl2br(waterNotes)}</p>` : ""}
    <p>While we cannot determine the exact cause without further inspection, common contributors include:</p>
    <ul>
      <li>Failed door sweeps or weather seals</li>
      <li>Gaps in thresholds</li>
      <li>Heavy rainfall pushing water into unsealed entry points</li>
      <li>Previous high-pressure washing performed by other vendors</li>
    </ul>
    <p>We will proceed cautiously in these areas and report any vulnerable spots before cleaning.</p>`
    : "";

  const timelineBlock = sectionOn("timeline")
    ? `<h2>Estimated timeline</h2>
    <p>Due to the size of the project and variability of soil levels across buildings, the total duration may vary slightly. To avoid giving an inaccurate timeframe, we estimate:</p>
    <p><strong>~${slot(state.workingDays, "working days")} working days</strong></p>
    <p>We will update management each day on progress so you always know where the team is working.</p>`
    : "";

  const residentBlock = sectionOn("residentImpact")
    ? `<h2>Resident &amp; property impact</h2>
    <ul>
      <li>Work can be performed during standard daylight hours</li>
      <li>Safe for painted surfaces when using low pressure</li>
      <li>Residents will be notified to keep items away from doors and walkways</li>
    </ul>`
    : "";

  const deliverablesBlock = sectionOn("deliverables")
    ? `<h2>Deliverables</h2>
    <p>At completion, AmenityWorks will provide:</p>
    <ul>${deliverableList().map((d) => `<li>${esc(d)}</li>`).join("")}</ul>`
    : "";

  const insuranceBlock = sectionOn("insurance")
    ? `<div class="keep-together">
    <h2>Insurance</h2>
    <ul>
      ${INSURANCE_LINES.map((line) => `<li>${esc(line)}</li>`).join("")}
    </ul>
    </div>`
    : "";

  const dateLine = [
    formatLongDate(state.quoteDate),
    state.validUntil ? `Valid through ${formatLongDate(state.validUntil)}` : "",
    state.quoteNumber,
  ]
    .filter(Boolean)
    .join(" · ");

  const footerLabel = property ? `${property} Proposal` : "Proposal";

  els.proposal.innerHTML = `
    <table class="print-sheet">
      <thead><tr><td></td></tr></thead>
      <tfoot>
        <tr><td><div class="print-foot">${esc(footerLabel)}</div></td></tr>
      </tfoot>
      <tbody>
        <tr><td>
          ${state.isSample ? `<div class="sample-banner">Sample only — not a live bid</div>` : ""}
          <header class="letterhead">
            ${logoMarkup()}
            <div class="co-name">AMENITYWORKS</div>
            <div class="co-meta">
              ${esc(company.name || "AmenityWorks LLC")}<br>
              ${esc(company.address || "")}<br>
              ${esc(company.phone || "")}${company.email ? ` · ${esc(company.email)}` : ""}
            </div>
            ${dateLine ? `<div class="doc-dates">${esc(dateLine)}</div>` : ""}
          </header>

          <h1>${slot(property, "Property name")}</h1>
          <p class="subtitle">${esc(t.titleKind)}<br>Submitted by ${esc(company.name || "AmenityWorks LLC")}</p>
          ${metaRows ? `<table class="meta-table">${metaRows}</table>` : ""}

          ${scopeBlock}
          ${servicesBlock}
          ${walkBlock}
          ${stain}
          ${pests}
          ${waterIntrusionBlock}
          ${additionalBlock}
          ${waterDamageBlock}
          ${timelineBlock}
          ${residentBlock}
          ${deliverablesBlock}
          ${invest}
          ${insuranceBlock}
          ${others}

          <p>Thank you for the opportunity to provide this proposal. We appreciate your consideration and look forward to partnering with you to keep ${
            property ? slot(property, "property") : "your property"
          } looking its best.</p>

          ${sign}
        </td></tr>
      </tbody>
    </table>
  `;

  document.title = footerLabel;
  els.xeroTitle.value = xeroTitle();
  els.xeroText.value = xeroDescription();
}

function bindForm() {
  const form = els.editor;
  const set = (name, value) => {
    const el = form.elements[name];
    if (!el) return;
    if (el.type === "checkbox") el.checked = !!value;
    else el.value = value ?? "";
  };
  set("templateId", state.templateId);
  set("propertyName", state.propertyName);
  set("address", state.address);
  set("clientName", state.clientName);
  set("contactName", state.contactName);
  set("quoteDate", state.quoteDate);
  set("validUntil", state.validUntil);
  set("quoteNumber", state.quoteNumber);
  set("customSurface", state.customSurface);
  set("coverage", state.coverage);
  set("scopeExtra", state.scopeExtra);
  set("walkthroughNotes", state.walkthroughNotes);
  set("waterDamageNotes", state.waterDamageNotes);
  set("barrierCap", state.barrierCap);
  set("workingDays", state.workingDays);
  set("extraDeliverable", state.extraDeliverable);
  els.templateHint.textContent = template().hint;
  renderSurfaceChips();
  renderSectionToggles();
  renderLineItems();
}

function renderSectionToggles() {
  if (!els.sectionToggles) return;
  els.sectionToggles.innerHTML = SECTIONS.map(
    (s) => `<label class="check">
      <input type="checkbox" data-section="${s.id}" ${sectionOn(s.id) ? "checked" : ""} />
      <span>${esc(s.label)}</span>
    </label>`
  ).join("");
}

function renderSurfaceChips() {
  els.surfaceChips.innerHTML = SURFACES.map(
    (s) => `<label class="chip">
      <input type="checkbox" data-surface="${s.id}" ${state.surfaces[s.id] ? "checked" : ""} />
      ${esc(s.label)}
    </label>`
  ).join("");
}

function renderLineItems() {
  if (!state.lineItems.length) {
    els.lineItems.innerHTML = `<p class="hint">No investment lines yet. Add one if you want pricing on the PDF.</p>`;
    return;
  }
  els.lineItems.innerHTML = state.lineItems
    .map((line) => {
      const opts = LINE_PRESETS.map(
        (p) => `<option value="${p.id}" ${line.preset === p.id ? "selected" : ""}>${esc(p.name)}</option>`
      ).join("");
      return `<div class="line" data-id="${esc(line.id)}">
        <label class="field">
          <span>Xero item</span>
          <select data-k="preset">${opts}</select>
        </label>
        <label class="field">
          <span>Note (buildings / area)</span>
          <input type="text" data-k="note" value="${esc(line.note || "")}" placeholder="Buildings 1–6" />
        </label>
        <label class="field">
          <span>Qty</span>
          <input type="number" data-k="qty" min="0" step="any" value="${line.qty ?? ""}" ${
            line.unit === "flat" ? "disabled" : ""
          } />
        </label>
        <label class="field">
          <span>Unit</span>
          <select data-k="unit">
            <option value="sq ft" ${line.unit === "sq ft" ? "selected" : ""}>sq ft</option>
            <option value="building" ${line.unit === "building" ? "selected" : ""}>building</option>
            <option value="window" ${line.unit === "window" ? "selected" : ""}>window</option>
            <option value="flat" ${line.unit === "flat" ? "selected" : ""}>lump sum</option>
          </select>
        </label>
        <label class="field">
          <span>Rate / amount</span>
          <input type="number" data-k="rate" min="0" step="any" value="${line.rate ?? ""}" />
        </label>
        <div>
          <div class="amt">${money(lineAmount(line))}</div>
          <button type="button" class="btn-x" data-remove title="Remove">×</button>
        </div>
      </div>`;
    })
    .join("");
}

function persist() {
  saveJSON(DRAFT_KEY, state);
}

function applyTemplateDefaults(prevId, nextId) {
  if (prevId === nextId) return;
  const next = TEMPLATES[nextId];
  if (!next) return;
  const prev = TEMPLATES[prevId];
  const surfaceWasDefault =
    !prev || SURFACES.every((s) => !!state.surfaces[s.id] === prev.defaultSurfaces.includes(s.id));
  if (surfaceWasDefault) state.surfaces = defaultSurfaces(next.defaultSurfaces);
  if (!prev || String(state.barrierCap) === String(prev.barrierCap)) state.barrierCap = next.barrierCap;
  if (!prev || String(state.workingDays) === String(prev.defaultDays)) state.workingDays = next.defaultDays;
}

function onEditorEvent(e) {
  const el = e.target;
  if (el.dataset.surface) {
    state.surfaces[el.dataset.surface] = el.checked;
    persist();
    renderProposal();
    return;
  }
  if (el.dataset.section) {
    if (!state.sections) state.sections = defaultSections();
    state.sections[el.dataset.section] = el.checked;
    persist();
    renderProposal();
    return;
  }
  const line = el.closest(".line");
  if (line) {
    const item = state.lineItems.find((l) => l.id === line.dataset.id);
    if (!item) return;
    if (el.dataset.remove != null || el.hasAttribute("data-remove")) return;
    const k = el.dataset.k;
    if (!k) return;
    if (k === "preset") {
      const p = LINE_PRESETS.find((x) => x.id === el.value) || LINE_PRESETS[LINE_PRESETS.length - 1];
      item.preset = p.id;
      item.name = p.name;
      item.unit = p.unit;
      item.rate = p.rate;
      if (p.unit === "flat") item.qty = 1;
      persist();
      renderLineItems();
      renderProposal();
      return;
    }
    item[k] = el.type === "number" ? el.value : el.value;
    if (k === "unit" && el.value === "flat") item.qty = 1;
    persist();
    renderLineItems();
    renderProposal();
    return;
  }
  const name = el.name;
  if (!name) return;
  if (name === "templateId") {
    applyTemplateDefaults(state.templateId, el.value);
    state.templateId = el.value;
    state.isSample = false;
    persist();
    bindForm();
    renderProposal();
    return;
  }
  state[name] = el.type === "checkbox" ? el.checked : el.value;
  state.isSample = false;
  persist();
  renderProposal();
}

function addLine() {
  const t = template();
  const guess =
    t.id === "breezeway_flatwork"
      ? LINE_PRESETS.find((p) => p.id === "breezeways")
      : LINE_PRESETS.find((p) => p.id === "walls");
  state.lineItems.push({
    id: uid(),
    preset: guess.id,
    name: guess.name,
    note: "",
    qty: "",
    unit: guess.unit,
    rate: guess.rate,
  });
  persist();
  renderLineItems();
  renderProposal();
}

function removeLine(id) {
  state.lineItems = state.lineItems.filter((l) => l.id !== id);
  persist();
  renderLineItems();
  renderProposal();
}

function loadSavedList() {
  const saved = loadJSON(SAVED_KEY, []);
  const current = state.savedId || "";
  els.savedSelect.innerHTML =
    `<option value="">— Current draft —</option>` +
    saved
      .slice()
      .sort((a, b) => (b.updated || 0) - (a.updated || 0))
      .map(
        (s) =>
          `<option value="${esc(s.id)}" ${s.id === current ? "selected" : ""}>${esc(
            s.name
          )} · ${new Date(s.updated).toLocaleDateString()}</option>`
      )
      .join("");
}

function saveNamed() {
  const name = (state.propertyName || "").trim() || "Untitled property";
  const saved = loadJSON(SAVED_KEY, []);
  const id = state.savedId || uid();
  state.savedId = id;
  state.isSample = false;
  const rec = { id, name, updated: Date.now(), state: JSON.parse(JSON.stringify(state)) };
  const idx = saved.findIndex((s) => s.id === id);
  if (idx >= 0) saved[idx] = rec;
  else saved.push(rec);
  saveJSON(SAVED_KEY, saved);
  persist();
  loadSavedList();
  flash(`Saved “${name}”`);
}

function openSaved(id) {
  if (!id) return;
  const saved = loadJSON(SAVED_KEY, []);
  const rec = saved.find((s) => s.id === id);
  if (!rec) return;
  state = withSections({ ...blankState(rec.state.templateId), ...rec.state, savedId: rec.id });
  persist();
  bindForm();
  loadSavedList();
  renderProposal();
}

function deleteSaved() {
  const id = state.savedId || els.savedSelect.value;
  if (!id) {
    flash("Nothing saved to delete");
    return;
  }
  const saved = loadJSON(SAVED_KEY, []).filter((s) => s.id !== id);
  saveJSON(SAVED_KEY, saved);
  state.savedId = "";
  persist();
  loadSavedList();
  flash("Deleted saved proposal");
}

function flash(msg) {
  els.copyStatus.textContent = msg;
  setTimeout(() => {
    if (els.copyStatus.textContent === msg) els.copyStatus.textContent = "";
  }, 2500);
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    flash(`${label} copied`);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    flash(`${label} copied`);
  }
}

function setView(view) {
  els.workspace.dataset.view = view;
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.view === view);
  });
}

function openSettings() {
  document.getElementById("coName").value = company.name || "";
  document.getElementById("coAddress").value = company.address || "";
  document.getElementById("coPhone").value = company.phone || "";
  document.getElementById("coEmail").value = company.email || "";
  document.getElementById("coWebsite").value = company.website || "";
  document.getElementById("coValidity").value = company.validityDays || 14;
  els.settingsModal.hidden = false;
}

function saveCompany() {
  company = {
    name: document.getElementById("coName").value.trim() || DEFAULT_COMPANY.name,
    address: document.getElementById("coAddress").value.trim(),
    phone: document.getElementById("coPhone").value.trim(),
    email: document.getElementById("coEmail").value.trim(),
    website: document.getElementById("coWebsite").value.trim(),
    validityDays: Number(document.getElementById("coValidity").value) || 14,
  };
  saveJSON(COMPANY_KEY, company);
  const status = document.getElementById("companySaveStatus");
  if (status) status.textContent = "Saved";
  renderProposal();
  flash("Company defaults saved");
  window.setTimeout(() => {
    els.settingsModal.hidden = true;
    if (status) status.textContent = "";
  }, 350);
}

els.editor.addEventListener("input", onEditorEvent);
els.editor.addEventListener("change", onEditorEvent);
els.lineItems.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove]");
  if (!btn) return;
  const line = btn.closest(".line");
  if (line) removeLine(line.dataset.id);
});

document.getElementById("btnAddLine").addEventListener("click", addLine);
document.getElementById("btnSave").addEventListener("click", saveNamed);
document.getElementById("btnDeleteSaved").addEventListener("click", deleteSaved);
document.getElementById("savedSelect").addEventListener("change", (e) => openSaved(e.target.value));
document.getElementById("btnSample").addEventListener("click", () => {
  state = sampleState();
  persist();
  bindForm();
  loadSavedList();
  renderProposal();
  flash("Sample loaded — replace the yellow fields");
});
document.getElementById("btnReset").addEventListener("click", () => {
  state = blankState(state.templateId);
  persist();
  bindForm();
  loadSavedList();
  renderProposal();
});
document.getElementById("btnSettings").addEventListener("click", openSettings);
document.getElementById("btnCloseSettings").addEventListener("click", () => {
  els.settingsModal.hidden = true;
});
document.getElementById("btnSaveCompany").addEventListener("click", saveCompany);
els.settingsModal.addEventListener("click", (e) => {
  if (e.target === els.settingsModal) els.settingsModal.hidden = true;
});

document.getElementById("btnPrint").addEventListener("click", () => window.print());
document.getElementById("btnPrintMobile").addEventListener("click", () => window.print());
document.getElementById("btnCopyTitle").addEventListener("click", () => copyText(xeroTitle(), "Xero title"));
document.getElementById("btnCopyTitle2").addEventListener("click", () => copyText(xeroTitle(), "Xero title"));
document.getElementById("btnCopyXero").addEventListener("click", () => copyText(xeroDescription(), "Xero description"));
document.getElementById("btnCopyXero2").addEventListener("click", () => copyText(xeroDescription(), "Xero description"));
document.getElementById("btnCopyXeroMobile").addEventListener("click", () => {
  setView("xero");
  copyText(xeroDescription(), "Xero description");
});

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => setView(btn.dataset.view));
});

if (new URLSearchParams(location.search).has("sample")) {
  state = sampleState();
  persist();
}

bindForm();
loadSavedList();
renderProposal();
