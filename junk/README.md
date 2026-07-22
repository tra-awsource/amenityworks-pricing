# Junk Haul Pricer · AmenityWorks

Browser app for **junk & bulk waste** pricing in Austin, TX.

**Job types:** one-off residential · **one-off commercial** · recurring residential · recurring commercial

## Open

Double-click:

`C:\Users\tracy\Documents\Junk-Haul-Pricer\index.html`

Or PowerShell:

```powershell
Start-Process "C:\Users\tracy\Documents\Junk-Haul-Pricer\index.html"
```

## Tabs

| Tab | Use |
|-----|-----|
| **Job quote** | Build a price for this pickup (volume, items, adders) |
| **Rate card** | Edit res one-off, commercial one-off, and recurring rates |
| **True costs** | Labor $/hr, miles, lead 3×, truck share, target margins |
| **How to price** | Four job types explained |

## Pricing logic

1. **Customer price** = rate card for that job type (volume and/or items) + adders  
2. **Hybrid mode** (default) = charge the **higher** of item total vs volume tier  
3. **True cost floor** = labor + miles + dump + lead×mult + truck share + overhead  
4. Never take a job under the floor; aim for target margin % for that job type  
5. **One-off commercial** defaults ~15% above residential one-off (COI, docks, Net terms)  

## Related

- Demo / deck tear-down: `Documents\Demo-Job-Pricer`
