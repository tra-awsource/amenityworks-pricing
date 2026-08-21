# AmenityWorks Proposal Builder

Locked bid language for multifamily pressure / soft wash. You only fill **property-specific fields**. The rest of the proposal stays the same on every bid.

## Open it

- Hub → **Proposal Builder**
- Or `proposals/index.html` in this folder
- Live (after you push): https://tra-awsource.github.io/amenityworks-pricing/proposals/

Same access password as the other pricing apps.

## Daily use

1. Pick a **template**
   - Building exteriors (walls, balconies, windows)
   - Breezeways & flatwork
   - Combined community clean
2. Fill the yellow placeholders: property name, coverage, timeline, barrier cap, walkthrough notes.
3. Optional: add the same **investment lines** you will put in Xero.
4. **Print / Save PDF** — in the print dialog choose Save as PDF. Email it or attach it to the Xero quote.
5. **Copy Xero title** and **Copy Xero description** — paste into the Xero quote. Enter line items in Xero as usual.

**Save** stores the draft in this browser so you can reopen a property later.

## What is locked vs editable

| Locked (same every time) | You fill per property |
|---|---|
| Scope explanation | Property name, address, client |
| Services included | Surfaces included |
| Stain disclaimer | Coverage (“throughout X” / Buildings 1–8) |
| Water intrusion prevention | Walkthrough notes |
| Additional measures / barrier process | Barrier cap ($4,500 or $1,500 default) |
| Common water-damage contributors | Observed damage notes |
| Resident impact | Working days |
| Insurance / other services | Quote #, dates, investment lines |

Empty required placeholders print in red (`[Property name]`) so you do not send a blank.

## Xero workflow

Keep using Xero for the actual quote and invoice. This app makes:

1. A **clean PDF proposal** property managers will actually read
2. A **congruent description** you paste into Xero so the quote PDF still has the legal/process language

Do not edit the description in Xero except to paste. If the locked language needs a permanent change, change it in `app.js` (`TEMPLATES`) so every future bid matches.
