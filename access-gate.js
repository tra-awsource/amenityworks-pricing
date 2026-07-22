/**
 * Shared password gate for AmenityWorks Pricing.
 * Compares SHA-256 of entered password to AW_ACCESS.passwordHash.
 */
(function () {
  const cfg = window.AW_ACCESS || {};
  const expected = (cfg.passwordHash || "").toLowerCase().trim();
  const storageKey = cfg.storageKey || "aw_pricing_access_v1";
  const sessionDays = typeof cfg.sessionDays === "number" ? cfg.sessionDays : 30;

  async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function isUnlocked() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || data.hash !== expected) return false;
      if (data.exp && Date.now() > data.exp) {
        localStorage.removeItem(storageKey);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  function lockSession() {
    try {
      localStorage.removeItem(storageKey);
    } catch (_) {}
  }

  function unlockSession() {
    const exp = Date.now() + sessionDays * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      storageKey,
      JSON.stringify({ hash: expected, exp: exp, at: Date.now() })
    );
  }

  function hideGate() {
    document.body.classList.remove("aw-locked");
    const gate = document.getElementById("aw-access-gate");
    if (gate) {
      gate.hidden = true;
      gate.setAttribute("aria-hidden", "true");
    }
  }

  function showGate() {
    document.body.classList.add("aw-locked");
    let gate = document.getElementById("aw-access-gate");
    if (!gate) {
      gate = document.createElement("div");
      gate.id = "aw-access-gate";
      gate.setAttribute("role", "dialog");
      gate.setAttribute("aria-modal", "true");
      gate.setAttribute("aria-labelledby", "aw-gate-title");
      gate.innerHTML = `
        <div class="aw-gate-card">
          <p class="aw-gate-eyebrow">AmenityWorks</p>
          <h1 id="aw-gate-title">Access required</h1>
          <p class="aw-gate-sub">Enter the shared password to open the pricing tools.</p>
          <form id="aw-gate-form" autocomplete="on">
            <label for="aw-gate-password">Password</label>
            <input id="aw-gate-password" name="password" type="password" autocomplete="current-password" required autofocus />
            <button type="submit">Unlock</button>
          </form>
          <p class="aw-gate-error" id="aw-gate-error" aria-live="polite"></p>
          <p class="aw-gate-hint">Authorized use only. Contact the owner if you need access.</p>
        </div>
      `;
      document.body.appendChild(gate);

      const form = document.getElementById("aw-gate-form");
      const input = document.getElementById("aw-gate-password");
      const err = document.getElementById("aw-gate-error");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        err.textContent = "";
        const pw = input.value || "";
        if (!pw) {
          err.textContent = "Enter the password.";
          return;
        }
        try {
          const hex = await sha256Hex(pw);
          if (hex === expected) {
            unlockSession();
            hideGate();
            input.value = "";
          } else {
            err.textContent = "Incorrect password.";
            input.select();
          }
        } catch (ex) {
          err.textContent = "Could not verify password (try HTTPS or a modern browser).";
        }
      });
    }
    gate.hidden = false;
    gate.setAttribute("aria-hidden", "false");
    setTimeout(() => {
      const input = document.getElementById("aw-gate-password");
      if (input) input.focus();
    }, 50);
  }

  function init() {
    if (!expected) {
      console.warn("AW_ACCESS.passwordHash missing — gate disabled.");
      return;
    }
    // crypto.subtle requires secure context (HTTPS or localhost)
    if (!window.crypto || !window.crypto.subtle) {
      document.body.innerHTML =
        '<p style="padding:2rem;font-family:system-ui">This site needs HTTPS to unlock. Open the GitHub Pages link, not a raw file.</p>';
      return;
    }
    if (isUnlocked()) {
      hideGate();
      return;
    }
    showGate();
  }

  // Expose logout for optional use
  window.AW_LOCK = function () {
    lockSession();
    showGate();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
