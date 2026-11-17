<!-- Generated from the live API reference. Edit the source on the server and re-run the export, not this file. -->
# Changelog

Changes to the v2 API, newest first. Watch this repository (Watch → Custom → Releases) to hear about new ones.

## 2026-11-11 · Fixed: Current gain now allows for bonus issues and stock splits

After a bonus or split, current_gain_percent compared today's share price with the price of an IPO share, so a 1:1 bonus read as a 50% fall. It is now worked out per IPO share.

- `current_gain_percent` on `/ipos` and `/ipos/{slug}` multiplies the CMP by the bonus and split ratio since listing, as recorded by BSE. 28 listed issues change, for example EaseMyTrip (1:1 bonus, 3:1 bonus with a ₹2 → ₹1 split, then a 1:1 bonus).
- `cmp` is unchanged and is still today's market price.
- New field `listing.cmp_adjust_factor` on `/ipos/{slug}`: today's shares per IPO share (1 when there was no bonus or split).

See: [GET /ipos](docs/endpoints.md#ep-ipos-list) · [GET /ipos/{slug}](docs/endpoints.md#ep-ipo-detail)

## 2026-11-02 · New: API docs and this changelog, inside the portal

The full v2 reference now lives in the portal and is marked against your own plan, so you can see at a glance which endpoints your key can call.

- Every endpoint shows **Included** or the plan that unlocks it, plus your own per-minute and daily limits.
- Ready-to-run curl, PHP, Python and JavaScript snippets with the base URL filled in.
- The Pre-IPO reference now documents fields that were already being served: `dealer_range`, `implied_market_cap_cr`, `ipo_journey_status`, `valuation.market_cap_basis`, `valuation.shares_outstanding`, `ipo.journey_status`, `ipo.journey_label` and `ipo.ipo_url`.

See: [GET /unlisted](docs/endpoints.md#ep-unlisted-list) · [GET /unlisted/{slug}](docs/endpoints.md#ep-unlisted-detail)

## 2026-11-01 · New: Developer portal: self-serve keys, usage history, renewals and invoices

Sign in with your mobile number to manage your key yourself — no email back-and-forth.

- Get a Free key instantly after completing your profile; copy it from the dashboard any time.
- Day-by-day request history for your key (recorded from 1 November 2026), next to today's live usage.
- Upgrade or renew by UPI from the portal; your plan moves as soon as the payment is approved, and every payment gets a downloadable PDF invoice.
- Regenerate your key yourself if it leaks (up to 3 times a day). The old key stops working at once.
- New keys look like `ipoguru_` followed by 40 characters. Existing `ipo_` keys keep working unchanged — nothing to do.

See: [Authentication](https://www.ipoguru.in/ipo-gmp-details-developer-api#doc-auth)

## 2026-10-13 · New · Free+: Pre-RHP IPOs: see mainboard issues before their dates are announced

Mainboard IPOs that already trade in the grey market but have no RHP or dates yet now appear across the API — weeks before most calendars list them.

- Listed first on `/ipos` and `/gmp`, and resolvable on every per-IPO endpoint: `/ipos/{slug}` and its `/gmp`, `/subscription` and `/anchors` sub-routes.
- New fields `stage` (`pre_rhp` or `live`) and `dates_tba` (`true` while the dates are not out). Date fields are `null` for these rows — handle that.
- `/ipos?status=upcoming` includes them, so an "upcoming IPOs" screen built on it fills itself earlier.

See: [GET /ipos](docs/endpoints.md#ep-ipos-list) · [GET /gmp](docs/endpoints.md#ep-gmp-all)

## 2026-10-13 · New · Standard+: Subscription in rupees, plus the QIB funding cost

Live subscription now tells you how much money each category has bid, not just how many times it is covered.

- `categories[].demand_crore` — rupee demand per category and per sub-category (FII, MF, bNII, sNII and more), in ₹ crore.
- `demand_price` — the price the demand is worked at (upper end of the band).
- `qib_interest_cost` — what it costs a QIB to fund its bid per share allotted, worked at 7–12% a year. `null` until QIBs start bidding.
- The exchanges publish no rupee figures; these are calculated by IPO Guru from the official share counts.

See: [GET /ipos/{slug}/subscription](docs/endpoints.md#ep-subscription)

## 2026-10-08 · New · Pro+: Pre-IPO shares: dealer price range, market cap and IPO journey

Unlisted share data went from a single price to a full picture of where the company stands.

- `dealer_range` — low / high / median of the latest quote from every dealer we track, with the dealer count. Present when two or more dealers quote the company.
- `implied_market_cap_cr` — price × shares outstanding, in ₹ crore. The detail endpoint adds `valuation.shares_outstanding` and `valuation.market_cap_basis`.
- `ipo_journey_status` — a 12-step stage from `rumoured` through `drhp_filed`, `sebi_approved`, `rhp_filed`, `ipo_open` to `listed`, derived from SEBI filings so it never goes stale. The detail endpoint adds `ipo.journey_label` and `ipo.ipo_url`.
- Coverage expanded sharply — from 23 companies at the start of October to 200+ today, most with a logo, profile and financials.

See: [GET /unlisted](docs/endpoints.md#ep-unlisted-list) · [GET /unlisted/{slug}](docs/endpoints.md#ep-unlisted-detail)

## 2026-10-06 · Improved · Free+: Stricter, more useful filters

Filters now either do what you asked or tell you why they cannot.

- `type` and `status` are case-insensitive (`status=Upcoming` works).
- **Behaviour change:** an unknown `type` or `status` value now returns `422` listing the allowed values. It used to be ignored silently and return the unfiltered list.
- `/ipos?search=` searches the whole archive — the default 3-month window is skipped when you search. Use `months=0` for no date limit without a search.
- `/unlisted?search=` also matches ISIN.

See: [GET /ipos](docs/endpoints.md#ep-ipos-list) · [Errors](https://www.ipoguru.in/ipo-gmp-details-developer-api#doc-errors)

## 2026-10-06 · Fixed · Pro+: Pre-IPO quotes: provenance and accurate 52-week range

Every unlisted price now says where it came from and how fresh it is.

- New fields `price_date` (date of the quote at source), `price_source`, `price_type` and `is_stale` (no price, or older than 7 days).
- **Fixed:** `week_52_high` / `week_52_low` could lag the live price. They are now recalculated from the stored daily prices on every refresh.
- Missing ISINs are filled in automatically.
- A company leaves `/unlisted` once its IPO lists (its detail endpoint returns `404`); use the IPO endpoints for it from then on.

See: [GET /unlisted](docs/endpoints.md#ep-unlisted-list)

## 2026-10-02 · Notice: API v1 retired

/api/v1 now answers 403 with error v1_retired. Your existing key works on /api/v2 as-is — only the base URL and endpoints change.

- The error body carries `v2_base_url` and a link to the plans, so a client can surface it.
- v1 and v2 keep separate counters, so moving does not touch your v2 quota.

See: [Base URL & authentication](https://www.ipoguru.in/ipo-gmp-details-developer-api#doc-auth)

## 2026-09-24 · New · Pro+: Pre-IPO (unlisted) share prices

Two new endpoints for the unlisted market: every tracked company with its latest indicative price, and one company with its full daily price history.

- `GET /unlisted` — list with price, 52-week range, lot size and minimum investment.
- `GET /unlisted/{slug}` — profile, valuation, IPO outlook and the complete price series (oldest first, ready to chart; `days=N` to trim).

See: [GET /unlisted](docs/endpoints.md#ep-unlisted-list) · [GET /unlisted/{slug}](docs/endpoints.md#ep-unlisted-detail)

## 2026-09-22 · New · Free+: API v2 launched

A clean, plan-based API for Indian IPO data: Free, Basic, Standard and Pro, each unlocking deeper data.

- IPO calendar and IPO documents for Mainboard and SME — dates, price band, lots, reservation and listing performance on every plan; financials, promoters, documents and contacts from Basic.
- Grey market: current GMP with kostak and subject-to-sauda rates, the day-wise trend (Standard) and the intraday timeline of up to 3 readings a day (Pro).
- Live subscription by category and sub-category (Standard), the day-by-day build-up (Pro) and anchor investor allocations (Standard).
- Offer For Sale issues with the live exchange bid book (Pro).
- `/me` returns your plan, scopes, limits and today's usage; a call outside your plan returns `402` with the cheapest plan that unlocks it in `upgrade_to`.

See: [Plans & scopes](https://www.ipoguru.in/ipo-gmp-details-developer-api#doc-scopes) · [GET /me](docs/endpoints.md#ep-me)
