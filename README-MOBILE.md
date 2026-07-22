# AmenityWorks Pricing — Phone Access

Both calculators live here:

`C:\Users\tracy\Documents\AmenityWorks-Pricing\`

| App | Path |
|-----|------|
| Hub (home) | `index.html` |
| Junk Haul | `junk\index.html` |
| Demo / deck | `demo\index.html` |

---

## Use on your phone (same Wi‑Fi)

1. On the **PC**, double-click:

   **`Start-Mobile-Server.bat`**

2. Leave that window **open**.

3. Note the line that looks like:

   `On your phone:  http://192.168.x.x:8080/`

4. On your **phone** (same Wi‑Fi), open Safari or Chrome and go to that address.

5. **Add to Home Screen** (looks like an app icon):

   - **iPhone (Safari):** Share button → **Add to Home Screen** → Add  
   - **Android (Chrome):** Menu ⋮ → **Install app** or **Add to Home screen**

6. Open **Junk** or **Demo** from the hub. Save defaults once on the phone so rates stick on that device.

---

## Important notes

| Topic | Detail |
|--------|--------|
| PC must be on | Server runs on your computer; phone talks to it over Wi‑Fi |
| Same network | Phone and PC must share the same Wi‑Fi (not guest/VPN isolation) |
| Windows Firewall | First run may ask to allow Python/PowerShell — choose **Private networks** |
| Saved prices | Phone browser storage ≠ PC browser — set rates once on phone |
| Offline | After first successful load, service worker may cache pages for short offline use on that network |

---

## Firewall (if phone cannot connect)

1. Windows Security → Firewall → Allow an app  
2. Allow **Python** or **PowerShell** on **Private** networks  

Or run once in Admin PowerShell:

```powershell
New-NetFirewallRule -DisplayName "AmenityWorks Pricing 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Private
```

---

## Access from anywhere (optional)

Same-Wi‑Fi only works at home/shop. For access anywhere:

1. Zip the `AmenityWorks-Pricing` folder  
2. Deploy free static host (e.g. [Netlify Drop](https://app.netlify.com/drop) — drag the folder)  
3. Open the HTTPS link on your phone → Add to Home Screen  

Do **not** put private customer data in the apps if the URL is public; rates in localStorage stay on each device.

---

## Desktop

You can still open:

- Hub: `AmenityWorks-Pricing\index.html`  
- Or run the server and use `http://localhost:8080/`

Older copies in `Demo-Job-Pricer` and `Junk-Haul-Pricer` are snapshots; **use this hub folder going forward** so phone and PC stay in sync when you edit files.
