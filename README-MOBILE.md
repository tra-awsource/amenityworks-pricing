# AmenityWorks Pricing — access from anywhere

## Your live URL (HTTPS)

### **https://tra-awsource.github.io/amenityworks-pricing/**

### Access password (starter — change soon)

| | |
|--|--|
| **Password** | `ChangeMe-AW-2026` |
| **Stored on site** | SHA-256 hash only (cannot be reversed) |
| **Change password** | Open [set-password.html](https://tra-awsource.github.io/amenityworks-pricing/set-password.html) → generate hash → paste into `access-config.js` → `git push` |
| **Session** | Stays unlocked ~30 days on that device, or use **Lock / log out** on the hub |

**Honesty note:** This stops casual visitors. A determined person who downloads the site files could still try to bypass client-side gates. For bank-level control, use Cloudflare Access (email allowlist) later.

| Page | URL |
|------|-----|
| Hub | https://tra-awsource.github.io/amenityworks-pricing/ |
| Junk Haul | https://tra-awsource.github.io/amenityworks-pricing/junk/ |
| Demo Job | https://tra-awsource.github.io/amenityworks-pricing/demo/ |

Repo: https://github.com/tra-awsource/amenityworks-pricing  

---

## Phone setup (once)

1. Open the hub link above in Safari (iPhone) or Chrome (Android).
2. **Add to Home Screen** / **Install app**.
3. Open **Junk** or **Demo** → enter your rates → **Save defaults**.

Works on cellular or any Wi‑Fi. No PC server needed.

---

## Notes

| | |
|--|--|
| **Public site** | Anyone with the URL can open the tools (no login). |
| **Your rates** | Stay in *that phone/browser* (localStorage) — not uploaded. |
| **PC vs phone** | Save defaults separately on each device the first time. |
| **Updates** | Edit files in `Documents\AmenityWorks-Pricing`, then push to GitHub (see below). |

---

## Update the live site after you change rates/code

```powershell
cd C:\Users\tracy\Documents\AmenityWorks-Pricing
git add -A
git commit -m "Update pricing apps"
git push
```

GitHub Pages rebuilds in about 1 minute.

---

## Optional: PC-only local server

Still available: `Start-Mobile-Server.bat` (same Wi‑Fi only). Prefer the live URL for everyday use.
