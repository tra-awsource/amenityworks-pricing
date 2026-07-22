# Demo Job Pricer

Browser app to price demolition / deck tear-down jobs using a **cost build-up** (labor + trailer + dump + fuel + misc → contingency → margin).

## Open the app

1. Go to: `C:\Users\tracy\Documents\Demo-Job-Pricer`
2. Double-click **`index.html`**
3. It opens in your browser — no install, no internet required after fonts load once

Or from PowerShell:

```powershell
Start-Process "C:\Users\tracy\Documents\Demo-Job-Pricer\index.html"
```

## How to use

1. Enter **job details** (sq ft, height, access, hot tub, crew, family job).
2. Set **your rates** (hourly, trailer $/day, dump fees, etc.).
3. Read **Floor / Market / Family / Recommended**.
4. **Copy quote** text to send the customer.
5. Click **Save defaults** so your rates stick for next time.

### Tips

- Leave **Hours override** blank to auto-estimate; type a number after a site visit.
- Same for **Trailer days**.
- **Floor** = don’t bid below this if you value your time and dumps correctly.
- **Family job** applies your family discount % off market.
- Dump fees: call your landfill and type the real number.

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell |
| `styles.css` | Layout / theme |
| `app.js` | Pricing math + quote text |
| `README.md` | This file |

Defaults are stored in the browser (`localStorage`) on this computer only.
