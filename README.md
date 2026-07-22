# AmenityWorks Pricing — Owner Guide

Personal junk-haul and demo pricing tools for **AmenityWorks (Austin, TX)**.  
Use this file whenever you forget how the site, password, or updates work.

---

## Quick links

| What | Where |
|------|--------|
| **Live site (anywhere)** | https://tra-awsource.github.io/amenityworks-pricing/ |
| **Junk Haul Pricer** | https://tra-awsource.github.io/amenityworks-pricing/junk/ |
| **Demo Job Pricer** | https://tra-awsource.github.io/amenityworks-pricing/demo/ |
| **Change password (hash tool)** | https://tra-awsource.github.io/amenityworks-pricing/set-password.html |
| **GitHub repo** | https://github.com/tra-awsource/amenityworks-pricing |
| **Files on your PC** | `C:\Users\tracy\Documents\AmenityWorks-Pricing\` |

**Password:** not stored in this README (on purpose).  
You set it; only a **hash** lives in `access-config.js`.  
If you forget it → make a **new** password (you cannot undo a hash).

---

## What’s in the box

| App | Use it for |
|-----|------------|
| **Hub** | Home screen — open Junk or Demo |
| **Junk Haul Pricer** | Volume / items, one-off res, one-off commercial, recurring, adders (stairs, heavy, paint $7.50/gal, mattress fee, hazmat handling, breakdown/extraction), cost floor, quote text |
| **Demo Job Pricer** | Deck/demo tear-down: labor + trailer $125/day + dump + contingency + margin, family vs market |

---

# 1. Use the site every day

### On your phone (recommended)

1. Open: https://tra-awsource.github.io/amenityworks-pricing/  
2. Enter the **shared access password** (unlocks ~30 days on that device).  
3. Tap **Junk** or **Demo**.  
4. **Add to Home Screen** (once):  
   - **iPhone (Safari):** Share → **Add to Home Screen**  
   - **Android (Chrome):** Menu ⋮ → **Install app** / Add to Home screen  
5. First time on a device: set your rates → **Save defaults**.

### On your PC

- Same live URL in Chrome/Edge, **or**  
- Open `C:\Users\tracy\Documents\AmenityWorks-Pricing\index.html` (password still needs **HTTPS** or localhost for the hash to work — prefer the live URL).

### Log out / lock

- On the hub: **Lock / log out**  
- Or clear site data for that site in the browser.

---

# 2. Who can access it

| | |
|--|--|
| **URL** | Public (anyone can open the page) |
| **Apps** | Blocked until they enter the **shared password** |
| **Share with helpers** | Give them the **password** (text/call), not only the link |
| **Your rates** | Saved in **each browser** only (localStorage) — not on GitHub |

**Limits:** This is a client-side password gate (good against casual visitors).  
It is **not** bank-level security. For email allowlists later, look up **Cloudflare Access**.

---

# 3. Change the access password

You **cannot reverse** a hash. You only **replace** it.

### Steps

1. Open: https://tra-awsource.github.io/amenityworks-pricing/set-password.html  
2. Type new password twice → **Generate hash**.  
3. **Copy the hash** (long string of letters/numbers).  
4. **Save the real password** in a password manager / notes (you need it to log in).  
5. On your PC, edit:

   `C:\Users\tracy\Documents\AmenityWorks-Pricing\access-config.js`

   Replace the line under `passwordHash:` with the new hash, for example:

   ```js
   passwordHash:
     "paste_new_hash_here",
   ```

6. Deploy (see section 4).

Everyone who had the old password must use the **new** one after the site updates (~1 minute after push).  
They may need to **Lock / log out** or wait for the old session to expire.

---

# 4. Publish updates to the live site (git push)

After you change files on the PC (password hash, rates in code, quote text, etc.):

```powershell
cd C:\Users\tracy\Documents\AmenityWorks-Pricing
git add -A
git status
git commit -m "Describe what you changed"
git push
```

- Live site rebuilds from GitHub Pages in about **1 minute**.  
- Hard-refresh on phone if it looks old: pull to refresh, or close tab and reopen.  
- If a service worker caches old files: Lock, reopen, or clear cache for the site.

### First-time git note

Repo is already set up as:

- Remote: `origin` → `https://github.com/tra-awsource/amenityworks-pricing`  
- Branch: `main`  
- GitHub Pages: branch `main`, folder `/`  

You only need `git add` / `commit` / `push` for future changes.

---

# 5. Junk Haul Pricer — how to price

### Job types

| Type | Rate card |
|------|-----------|
| One-off residential | Full retail |
| One-off commercial | ~15% above residential (COI, docks, Net terms) |
| Recurring residential / commercial | ~20% off residential retail |

### Pricing modes

- **Hybrid (default):** charge the **higher** of items vs volume  
- **Volume only** or **Items only** as needed  

### Cost floor (your costs — not a customer invoice)

```text
Floor = labor + miles + dump + mattress fees + paint $/gal
      + lead×3 + trailer share + overhead + hazmat handling
```

- **Customer pays:** volume/items + adders (from rate card).  
- **Margin** = charge − floor.  
- Low margin ⇒ rate card too low for trailer/dump, or floor inputs too high for that job.

### Important costs you set

| Item | Typical |
|------|---------|
| Trailer rental | **$125/day** (True costs → days on this job) |
| Labor cost | e.g. **$25/hr** (your cost, not customer hourly) |
| Miles | e.g. **$0.35/mi** |
| Paint dump | **$7.50/gallon** pass-through when gallons &gt; 0 |
| Mattress landfill | **$20 each** only if mattress qty in **Items** |
| Hazmat handling | Your flat fee ($15–$60 presets) for extra work |
| Breakdown / demo / **extraction** | Dig-outs (pylons, buried wood), breakdowns — $ each × count |

### Quote text

- States **hazardous / special waste is extra** (facility fees + handling).  
- Prefer clean **total + scope** for customers; full lines are for you in the app.

### Save defaults

**Save defaults** stores rates in **that browser**.  
Do it once on phone and once on PC if you use both.

---

# 6. Demo Job Pricer — how to price

### Build-up

```text
Bid ≈ labor hours × rate
    + trailer days × $125
    + dump + fuel + misc + footings
    + contingency %
    + margin (or family discount off market)
```

### Tips

- **Raised + solo** costs more time than ground + helper.  
- Don’t go under the **floor**.  
- Family jobs: discount off a real market number, don’t gift the whole job.  
- Trailer: count **every calendar day** you keep the rental.

---

# 7. Optional: local phone access (same Wi‑Fi only)

Usually you don’t need this if the live URL works.

1. Double-click `Start-Mobile-Server.bat` on the PC.  
2. Phone on **same Wi‑Fi** → open the `http://192.168.x.x:8080/` URL shown.  
3. Leave the server window open.

Prefer **https://tra-awsource.github.io/amenityworks-pricing/** for everyday use.

---

# 8. Folders on your PC

| Path | Role |
|------|------|
| `Documents\AmenityWorks-Pricing\` | **Source of truth** — edit + push from here |
| `Documents\AmenityWorks-Pricing\junk\` | Junk app |
| `Documents\AmenityWorks-Pricing\demo\` | Demo app |
| `Documents\Junk-Haul-Pricer\` | Old copy — don’t rely on it |
| `Documents\Demo-Job-Pricer\` | Old copy — don’t rely on it |
| `Documents\Algolia-Interview-Prep\` | Unrelated interview prep |

---

# 9. Troubleshooting

| Problem | Fix |
|---------|-----|
| Password wrong after you changed it | Confirm `access-config.js` was **pushed**; wait 1 min; hard-refresh; use **new** password |
| Forgot password | Cannot recover from hash → **set-password.html** → new hash → push |
| Site looks old on phone | Hard-refresh; Lock/log out; clear site data; wait for Pages build |
| “Could not verify password” | Must use **HTTPS** live site (not broken `file://` without crypto) |
| Rates missing on phone | **Save defaults** on that device |
| Phone can’t open site | Check internet; open hub URL; GitHub Pages status |
| Margin looks tiny | Floor includes trailer/dump; raise volume rates or check True costs inputs |
| Git push asks for login | Use GitHub CLI already logged in as `tra-awsource`, or sign in to GitHub |

Check Pages status:

```powershell
gh api repos/tra-awsource/amenityworks-pricing/pages
```

Look for `"status":"built"` and `html_url`.

---

# 10. Checklist — “I updated something”

- [ ] Edit files under `Documents\AmenityWorks-Pricing\`  
- [ ] If password change: hash in `access-config.js` only (password saved privately)  
- [ ] `git add -A`  
- [ ] `git commit -m "…"`  
- [ ] `git push`  
- [ ] Open live URL → confirm  
- [ ] On phone: refresh / re-unlock if needed  

---

# 11. Security reminders

1. Don’t put the **password** in the public README or a public commit.  
2. Don’t commit customer names/PII into the repo.  
3. Share password only with people you trust.  
4. Rotate password if it leaks.  
5. Client-side gate ≠ military security; good enough for private business tools.

---

*AmenityWorks · Austin, TX · Pricing tools for junk hauling & demo work*
