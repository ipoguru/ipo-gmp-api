<!-- Generated from the live API reference. Edit the source on the server and re-run the export, not this file. -->
# Endpoint reference

Base URL: `https://www.ipoguru.in/api/v2`. Every request needs the `X-API-KEY` header. Examples below were captured from live calls and trimmed.

## Contents

- **IPOs**: [IPO calendar](#ep-ipos-list) · [IPO detail](#ep-ipo-detail)
- **GMP**: [Current GMP, all live IPOs](#ep-gmp-all) · [Current GMP, one IPO](#ep-gmp-one) · [GMP history](#ep-gmp-history)
- **Subscription**: [Live subscription](#ep-subscription) · [Subscription history](#ep-subscription-history) · [Anchor investors](#ep-anchors)
- **OFS**: [Offer For Sale issues](#ep-ofs-list) · [OFS detail and bid book](#ep-ofs-detail)
- **Pre-IPO**: [Unlisted / pre-IPO shares](#ep-unlisted-list) · [Unlisted share detail](#ep-unlisted-detail)
- **Account**: [Key introspection](#ep-me) · [Plan catalogue](#ep-plans)

---

## IPOs

<a id="ep-ipos-list"></a>

### IPO calendar

```http
GET /api/v2/ipos
```

**Plan:** Free (every plan)

Every Mainboard and SME issue, newest first. This is the endpoint most integrations build their listing page on.

**Parameters**

| Name | Type | | Description |
|---|---|---|---|
| `type` | string | Optional | `mainboard` or `sme` (case-insensitive). Omit for both boards. |
| `status` | string | Optional | `open`, `upcoming`, `closed` or `listed`. Case-insensitive; any other value returns `422`. `upcoming` means an open date after today, plus pre-RHP mainboard issues whose dates are not yet announced (`dates_tba: true`). |
| `search` | string | Optional | Matches company name, display name or slug (partial, case-insensitive). |
| `months` | integer | Optional | Only issues that opened within the last N months. Defaults to `3` (no limit when `search` is given); pass `0` for no date limit. |
| `limit` | integer | Optional | Cap the number of rows returned. Applied per board, then to the merged result. |

**Response fields**

| Field | Type | Description |
|---|---|---|
| `slug` | string | Stable identifier. Use it for every other IPO endpoint — never the name. |
| `name` | string | Legal-ish company name as IPO Guru records it. |
| `display_name` | string | Shorter name for UI. Falls back to `name`. |
| `type` | string | `Mainboard` or `SME`. |
| `sub_type` | string\|null | Instrument — usually `Equity`. |
| `status` | string | `Upcoming`, `Open` or `Closed`, computed against today in IST. |
| `stage` | string | `live`, or `pre_rhp` for a mainboard issue already quoted in the grey market whose RHP dates are not yet announced. |
| `dates_tba` | boolean | True when no open date is set yet. Dates, price band and lot size are then null. |
| `is_listed` | boolean | True once the listing date has passed. |
| `logo` | string\|null | Absolute URL. Hotlinking is fine. |
| `open_date … listing_date` | string\|null | Dates as `YYYY-MM-DD`. Null until scheduled. |
| `price_band` | string\|null | As published, e.g. `"140-148"`. Free text — parse the two fields below instead. |
| `price_min / price_max` | number\|null | Band parsed for you. `price_max` is the cap price all derived maths uses. |
| `issue_price` | string\|null | Final issue price once fixed. |
| `issue_size` | string\|null | In ₹ crore, as published. |
| `lot_size` | integer\|null | Shares per lot. |
| `min_investment` | number\|null | `lot_size × price_max`, precomputed. |
| `gmp` | object | Current GMP block — see [/ipos/{slug}/gmp](endpoints.md#ep-gmp-one). |
| `subscription_total` | string\|null | Overall subscription in times, e.g. `"71.25"`. |
| `listing_price` | string\|null | Listing-day open. Null before listing. |
| `listing_gain_percent` | number\|null | Listing price vs issue price, 2dp. |
| `cmp` | string\|null | Current market price for listed issues. |
| `current_gain_percent` | number\|null | CMP vs issue price, 2dp, per IPO share: bonus issues and splits after listing are adjusted for. |
| `web_url` | string | Canonical page on ipoguru.in — useful for attribution links. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/ipos"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "standard",
  "count": 1,
  "data": [
    {
      "slug": "varmora-granito-ipo",
      "name": "Varmora Granito",
      "display_name": "Varmora Granito",
      "type": "Mainboard",
      "sub_type": "Equity",
      "status": "Open",
      "is_listed": false,
      "logo": "https://www.ipoguru.in/storage/logos/varmora-granito-ipo.webp",
      "open_date": "2026-09-22",
      "close_date": "2026-09-24",
      "allotment_date": "2026-09-25",
      "listing_date": "2026-09-29",
      "price_band": "140-148",
      "price_min": 140,
      "price_max": 148,
      "issue_price": "148",
      "issue_size": "708.02",
      "lot_size": 101,
      "min_investment": 14948,
      "gmp": {
        "price": "7.5",
        "percentage": "5.07",
        "kostak": null,
        "subject_to_sauda": "700,,9800",
        "estimated_listing_price": 155.5,
        "updated_at": "2026-09-22T07:06:09.000000Z",
        "updated_at_label": "22 Sep 2026, 12:36 PM IST"
      },
      "subscription_total": "0.07",
      "listing_price": null,
      "listing_gain_percent": null,
      "cmp": null,
      "current_gain_percent": null,
      "web_url": "https://www.ipoguru.in/ipo/varmora-granito-ipo"
    }
  ]
}
```

**Notes**

- There is no pagination. The default 3-month window keeps the payload small; widen it with `months` and cap it with `limit`.
- Rows are sorted by `open_date` descending across both boards. Pre-RHP issues (`dates_tba: true`) come first and ignore the `months` window.


<a id="ep-ipo-detail"></a>

### IPO detail

```http
GET /api/v2/ipos/{slug}
```

**Plan:** Free (every plan)

The full document for one issue: timeline, issue terms, GMP, subscription summary and listing performance — plus the editorial sections on paid plans.

**Parameters**

| Name | Type | | Description |
|---|---|---|---|
| `{slug}` | string | Required | Path segment. Take it from `/ipos`. |

**Response fields**

| Field | Type | Description |
|---|---|---|
| `stage / dates_tba` | string / boolean | As on `/ipos`. A `pre_rhp` issue has GMP and company details but null dates and price band. |
| `images` | object | `logo` and `feature` absolute URLs. |
| `timeline` | object | `open_date`, `close_date`, `allotment_date`, `refund_date`, `credit_to_demat_date`, `listing_date`. |
| `issue` | object | Size, price band (raw + parsed), face value, lot size, minimum investment, sale type, exchanges, `bse_scrip_code`, `nse_symbol`. |
| `gmp` | object | Current GMP block. |
| `subscription_summary` | object | Flat category totals plus `applications` and freshness stamps. |
| `listing` | object | Listing price, CMP and both gain percentages. `listing.cmp_adjust_factor` is today's shares per IPO share after bonus issues and splits (1 when none); `current_gain_percent` already allows for it. |
| `lot_calculator` | array | **Basic+.** Retail / S-HNI / B-HNI application tiers with lots, shares and rupee amounts. |
| `reservation` | array | **Basic+.** Category-wise reservation of the issue. |
| `shares_offered` | object | **Basic+.** Shares on offer per category as the exchange book published them (integers, null where none): `qib` (net of anchor), `nii` (net of the SME market maker), `retail`, `employee`, `shareholder`, `total`, plus `anchor` shares allotted. Final allotted counts are in `basis_of_allotment` on the subscription endpoint. |
| `company` | object | **Basic+.** About, description, `strengths[]`, `risks[]`, objects of issue, `financials` (headers + rows, ₹ crore), `kpis[]`, promoter profiles and holding pattern. |
| `contacts` | object | **Basic+.** Company, registrar (with `status_page` and `driver`) and lead managers. |
| `documents` | object | **Basic+.** RHP, DRHP, anchor and basis-of-allotment links. Frequently null. |
| `locked` | object | Present _only_ on Free, listing which blocks were withheld and why. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/ipos/skyways-air-services-ipo"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "basic",
  "data": {
    "slug": "skyways-air-services-ipo",
    "name": "Skyways Air Services",
    "type": "Mainboard",
    "status": "Closed",
    "is_listed": true,
    "timeline": {
      "open_date": "2026-08-24",
      "close_date": "2026-08-27",
      "allotment_date": "2026-08-28",
      "refund_date": "2026-08-31",
      "credit_to_demat_date": "2026-08-31",
      "listing_date": "2026-09-01"
    },
    "issue": {
      "issue_size": "582.8",
      "issue_price": "138",
      "price_band": "131-138",
      "price_min": 131,
      "price_max": 138,
      "face_value": "10",
      "lot_size": 100,
      "min_investment": 13800,
      "sale_type": "Fresh capital cum OFS",
      "listing_on": "BSE, NSE",
      "bse_scrip_code": "7903",
      "nse_symbol": "SKYWAYS.NS"
    },
    "listing": {
      "listing_price": "124",
      "listing_gain_percent": -10.14,
      "cmp": "126.46",
      "cmp_adjust_factor": 1,
      "current_gain_percent": -8.36
    },
    "lot_calculator": [
      { "label": "Retail (Min)", "lots": 1,  "shares": 100,  "amount": 13800 },
      { "label": "Retail (Max)", "lots": 14, "shares": 1400, "amount": 193200 }
    ],
    "company": {
      "about": "Skyways Air Services Limited is an Indian logistics …",
      "strengths": ["Sales have more than doubled in two years. …"],
      "risks": ["Debt is high and has kept rising, from Rs 357.34 crore …"],
      "financials": {
        "headers": ["31 Mar 2026", "31 Mar 2025", "31 Mar 2024"],
        "rows": [{ "metric": "Assets", "data": ["1,508.24", "1,321.64", "790.35"] }],
        "unit": "Rs. Crore"
      }
    },
    "contacts": {
      "registrar": {
        "name": "Bigshare Services Private Limited",
        "slug": "bigshare-services",
        "status_page": "https://ipo.bigshareonline.com/ipo_status.html",
        "supports_in_app": true
      }
    },
    "web_url": "https://www.ipoguru.in/ipo/skyways-air-services-ipo"
  }
}
```

**Notes**

- On the Free plan the response omits `lot_calculator`, `reservation`, `shares_offered`, `company`, `contacts` and `documents`, and adds a `locked` block naming them. It is still a `200`, not a `402`.
- `company.financials` and `objects_of_issue` carry a `text` fallback when the underlying value is prose rather than structured data. Check `rows`/`items` first, then `text`.
- SME issues have no `kpis` column upstream, so that array is empty for them.


---

## GMP

<a id="ep-gmp-all"></a>

### Current GMP, all live IPOs

```http
GET /api/v2/gmp
```

**Plan:** Free (every plan)

Grey Market Premium for every open and upcoming issue in a single call. Built so you never need one request per IPO.

**Parameters**

| Name | Type | | Description |
|---|---|---|---|
| `type` | string | Optional | `mainboard` or `sme` (case-insensitive). |
| `status` | string | Optional | `open` or `upcoming` (case-insensitive; any other value returns `422`). |

**Response fields**

| Field | Type | Description |
|---|---|---|
| `slug / name / type` | string | Identity of the issue. |
| `status` | string | Upcoming / Open / Closed. |
| `stage / dates_tba` | string / boolean | `pre_rhp` + `true` for an issue quoted before its dates are announced; these lead the list. |
| `price_band` | string\|null | As published. |
| `issue_price` | string\|null | Final issue price where fixed. |
| `gmp` | object | The GMP block, documented on the next endpoint. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/gmp"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "free",
  "count": 12,
  "data": [
    {
      "slug": "varmora-granito-ipo",
      "name": "Varmora Granito",
      "type": "Mainboard",
      "status": "Open",
      "price_band": "140-148",
      "issue_price": "148",
      "gmp": {
        "price": "7.5",
        "percentage": "5.07",
        "kostak": null,
        "subject_to_sauda": "700,,9800",
        "estimated_listing_price": 155.5,
        "updated_at": "2026-09-22T07:06:09.000000Z",
        "updated_at_label": "22 Sep 2026, 12:36 PM IST"
      }
    }
  ]
}
```

**Notes**

- Scoped to issues that opened within the last three months, so it stays a small response even on a busy week.
- This is the right endpoint to poll. Polling `/ipos/{slug}/gmp` in a loop will exhaust your quota for no extra data.


<a id="ep-gmp-one"></a>

### Current GMP, one IPO

```http
GET /api/v2/ipos/{slug}/gmp
```

**Plan:** Free (every plan)

The latest grey-market reading for a single issue.

**Parameters**

| Name | Type | | Description |
|---|---|---|---|
| `{slug}` | string | Required | IPO slug. |

**Response fields**

| Field | Type | Description |
|---|---|---|
| `gmp.price` | string\|null | Premium in ₹ over the cap price, as recorded. String, because the source publishes it as text. |
| `gmp.percentage` | string\|null | Premium as a percentage of the cap price. |
| `gmp.kostak` | string\|null | Kostak rate — the flat price paid for an application regardless of allotment. Tracked for featured issues only, so usually null. |
| `gmp.subject_to_sauda` | string\|null | Price paid for an application _conditional_ on allotment. Tracked for roughly 30 issues at a time. May contain multiple comma-separated figures exactly as published. |
| `gmp.estimated_listing_price` | number\|null | `price_max + gmp.price`, precomputed. Arithmetic, not a forecast. |
| `gmp.updated_at` | string\|null | UTC ISO-8601 timestamp of the reading. |
| `gmp.updated_at_label` | string\|null | The same moment formatted in IST for display. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/ipos/skyways-air-services-ipo/gmp"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "free",
  "data": {
    "slug": "skyways-air-services-ipo",
    "name": "Skyways Air Services",
    "type": "Mainboard",
    "gmp": {
      "price": "32",
      "percentage": "23.19",
      "kostak": null,
      "subject_to_sauda": null,
      "estimated_listing_price": 170,
      "updated_at": "2026-09-01T02:54:03.000000Z",
      "updated_at_label": "01 Sep 2026, 08:24 AM IST"
    }
  }
}
```

**Notes**

- A GMP of `"0"` is a real reading — the grey market priced it at nil. It is not a missing value. A missing value is `null`.
- Always surface `updated_at` to your users. A premium from yesterday evening looks identical to one from five minutes ago unless you show the stamp.


<a id="ep-gmp-history"></a>

### GMP history

```http
GET /api/v2/ipos/{slug}/gmp/history
```

**Plan:** Standard and above

The archive behind the live number: a day-wise series on Standard, plus the intraday timeline on Pro.

**Parameters**

| Name | Type | | Description |
|---|---|---|---|
| `{slug}` | string | Required | IPO slug. |
| `days` | integer | Optional | Trim to the most recent N days. Cannot widen beyond what your plan allows. |

**Response fields**

| Field | Type | Description |
|---|---|---|
| `summary.current` | object | The live GMP block. |
| `summary.high / low` | object\|null | Peak and trough with the dates they occurred, across the returned window. |
| `summary.first` | object\|null | The earliest reading in the window. |
| `summary.days` | integer | Number of daily points returned. |
| `summary.points` | integer | Number of intraday points returned. `0` below Pro. |
| `summary.issue_price` | number\|null | Cap price used for the derived listing estimates. |
| `trend[]` | array | One point per day — that day’s last reading. Oldest first, ready to plot. |
| `trend[].price_value` | number\|null | Numeric premium. Use this for maths; `price` is the raw string. |
| `timeline[]` | array | **Pro.** Intraday points sampled at 11 AM, 5 PM and 10 PM IST, plus a trailing live reading on the current day. |
| `timeline[].slot` | integer\|null | Hour of the slot (11, 17, 22). Null on the trailing live point. |
| `timeline[].recorded_at` | string | When the reading was actually captured, which is near but not exactly the slot hour. |
| `locked` | object | Present below Pro, naming `timeline` as withheld. |
| `truncated` | object | Present only when a plan ceiling actually clipped the window. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/ipos/skyways-air-services-ipo/gmp/history"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "pro",
  "data": {
    "summary": {
      "current": { "price": "32", "percentage": "23.19", "estimated_listing_price": 170 },
      "high":  { "price": 39.5, "date": "2026-08-31" },
      "low":   { "price": 32,   "date": "2026-09-01" },
      "first": { "price": 32,   "date": "2026-08-31" },
      "days": 2,
      "points": 4,
      "issue_price": 138
    },
    "trend": [
      {
        "date": "2026-08-31",
        "price": "32",
        "price_value": 32,
        "percentage": "23.19",
        "kostak": null,
        "subject_to_sauda": null,
        "estimated_listing_price": 170
      }
    ],
    "timeline": [
      {
        "date": "2026-08-31",
        "slot": 11,
        "slot_label": "11 AM",
        "label": "31 Aug 2026, 11 AM",
        "recorded_at": "2026-08-31 10:48:02",
        "price_value": 39.5,
        "percentage": "28.62",
        "estimated_listing_price": 177.5
      }
    ]
  }
}
```

**Notes**

- A single IPO’s GMP history only spans its own bidding window — typically two to four weeks, 31 days at the outside. There is no multi-year series for one issue.
- Below Pro, `timeline` is an empty array rather than an absent key, so client code that iterates it needs no null check.


---

## Subscription

<a id="ep-subscription"></a>

### Live subscription

```http
GET /api/v2/ipos/{slug}/subscription
```

**Plan:** Standard and above

Bidding figures as they stand right now, as a category → sub-category tree.

**Parameters**

| Name | Type | | Description |
|---|---|---|---|
| `{slug}` | string | Required | IPO slug. |

**Response fields**

| Field | Type | Description |
|---|---|---|
| `summary` | object | Flat totals per category plus `applications` and freshness stamps. |
| `applications_source` | string\|null | Where the application count came from — `boa` once basis of allotment is out, otherwise the exchange feed. |
| `categories[]` | array | Ordered QIB, NII, Retail, Employee, Shareholder, Anchor, Total. Categories with no data are omitted entirely. |
| `categories[].key` | string | Stable machine key — see the category table below. |
| `categories[].times` | string\|null | Subscription in times, as published. |
| `categories[].times_value` | number\|null | The same figure parsed to a number. |
| `categories[].shares_offered / shares_applied` | string\|null | Share counts from the exchange book. Offered shares are as the exchange counts them during bidding, which for many issues is at the lower end of the price band — see `basis_of_allotment` for the final counts. QIB is net of anchor; for SME issues NII and Total are net of the market maker, whose shares are not open for bidding. |
| `categories[].applications` | string\|null | Application count where the exchange reports it. Retail, NII, bNII, sNII and Total carry it during bidding; QIB is filled once the basis of allotment is out (the live exchange feed has no QIB count). |
| `categories[].demand_crore` | number\|null | Rupee demand in ₹ crore: `shares_applied × demand_price ÷ 1,00,00,000`, 2dp. Present on sub-categories too. |
| `categories[].sub_categories[]` | array | Finer buckets — FII, MF, bNII/sNII splits, cut-off vs price bids. |
| `demand_price` | number\|null | Price the demand figures are worked at — the upper end of the price band, where cut-off bids are struck. |
| `basis_of_allotment` | object\|null | The registrar's final Basis of Allotment, kept apart from the bidding book. Null until allotment is published. `issue_price` (the full price), `total_shares_allotted` (final shares, anchor included), `source`, and `categories[]` keyed `QIB` (with anchor), `QIB_EX_ANCHOR`, `ANCHOR`, `NII`, `BNII`, `SNII`, `RETAIL`, `EMPLOYEE`, `SHAREHOLDER`, `TOTAL`, each with `price`, `times`, `applications`, `shares_applied`, `shares_allotted`, `allottees`, `amount_collected` and `allotment_chance_percent` (allottees ÷ applications). The `TOTAL` row's `price` is a blend when employees or shareholders got a discount; use `issue_price`. |
| `qib_interest_cost` | object\|null | What it costs a QIB to fund its bid, per share allotted, over `days` (7): `price × qib_times × rate × days ÷ 365`. `funds_per_share` is the money blocked per share allotted; `rates[]` works it at 7–12% a year, with `cost_percent` of the price. Null until QIB bidding starts. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/ipos/skyways-air-services-ipo/subscription"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "standard",
  "data": {
    "slug": "skyways-air-services-ipo",
    "name": "Skyways Air Services",
    "type": "Mainboard",
    "summary": {
      "total": "71.25",
      "qib": "139.69",
      "nii": "87.24",
      "retail": "25.4",
      "employee": "0",
      "shareholder": "0",
      "anchor": null,
      "applications": "3364884",
      "updated_at": "2026-09-01T13:01:00.000000Z",
      "updated_at_label": "01 Sep 2026, 06:31 PM IST"
    },
    "applications_source": "boa",
    "demand_price": 138,
    "categories": [
      {
        "key": "QIB",
        "label": "Qualified Institutional Buyers (QIB)",
        "times": "139.69",
        "times_value": 139.69,
        "shares_offered": "8432000",
        "shares_applied": "1177854000",
        "applications": "114",
        "amount": null,
        "demand_crore": 16254.39,
        "sub_categories": [
          {
            "key": "FII",
            "label": "Foreign Institutional Investors",
            "times": "",
            "times_value": null,
            "shares_applied": "144198100",
            "demand_crore": 1989.93
          }
        ]
      }
    ],
    "qib_interest_cost": {
      "price": 138,
      "qib_times": 139.69,
      "days": 7,
      "funds_per_share": 19277.22,
      "rates": [
        { "rate_percent": 7,  "cost_per_share": 25.88, "cost_percent": 18.75 },
        { "rate_percent": 8,  "cost_per_share": 29.58, "cost_percent": 21.43 },
        { "rate_percent": 12, "cost_per_share": 44.36, "cost_percent": 32.15 }
      ]
    }
  }
}
```

**Notes**

- For Mainboard issues the consolidated NSE figure is used. Never add BSE and NSE numbers together — they are already consolidated, and summing them double-counts. BSE SME issues come from BSE and NSE SME issues from NSE.
- The bidding book and `basis_of_allotment` differ by design: the book counts bids before technical rejections and offered shares as the exchange states them during bidding; the allotment counts are final, at the issue price. A subscription multiple worked from `basis_of_allotment` will usually be a little different from the live `times`.
- Empty strings appear in `times` where the exchange published a blank. Prefer `times_value`, which is `null` in that case.
- `demand_crore` and `qib_interest_cost` are calculated by IPO Guru from the published share counts — the exchanges publish no rupee figures. `amount` is a legacy field and is always null; use `demand_crore`.
- `qib_interest_cost` is arithmetic, not advice: it shows the listing premium a fully leveraged QIB needs just to cover its funding, not whether to bid.


<a id="ep-subscription-history"></a>

### Subscription history

```http
GET /api/v2/ipos/{slug}/subscription/history
```

**Plan:** Pro and above

How the book built up, day by day across the bidding window.

**Parameters**

| Name | Type | | Description |
|---|---|---|---|
| `{slug}` | string | Required | IPO slug. |

**Response fields**

| Field | Type | Description |
|---|---|---|
| `count` | integer | Number of snapshots returned. |
| `day_wise[]` | array | Oldest first. |
| `day_wise[].day` | integer\|null | Bidding day number — 1 is the opening day. |
| `day_wise[].date` | string | `YYYY-MM-DD`. |
| `day_wise[].time` | string\|null | `HH:MM:SS` IST of the snapshot. |
| `day_wise[].qib … total` | string\|null | Subscription in times per category at that moment. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/ipos/skyways-air-services-ipo/subscription/history"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "pro",
  "data": {
    "slug": "skyways-air-services-ipo",
    "name": "Skyways Air Services",
    "type": "Mainboard",
    "count": 4,
    "day_wise": [
      {
        "day": 1,
        "date": "2026-08-24",
        "time": "19:30:41",
        "qib": "0.46",
        "nii": "0.92",
        "retail": "1.65",
        "employee": "0",
        "shareholder": "0",
        "total": "1.16"
      }
    ]
  }
}
```

**Notes**

- One snapshot per bidding day, taken near the close of the exchange window — not a continuous intraday series.


<a id="ep-anchors"></a>

### Anchor investors

```http
GET /api/v2/ipos/{slug}/anchors
```

**Plan:** Standard and above

Who was allotted in the anchor book, for how much, with a roll-up by fund house.

**Parameters**

| Name | Type | | Description |
|---|---|---|---|
| `{slug}` | string | Required | IPO slug. |

**Response fields**

| Field | Type | Description |
|---|---|---|
| `summary.total_anchors` | integer | Number of anchor entities allotted. |
| `summary.total_amount_cr` | number | Total anchor book in ₹ crore. |
| `summary.mutual_fund_count` | integer | How many allottees are mutual funds — a quality signal readers look for. |
| `summary.anchor_document` | string\|null | Link to the filed anchor allocation document, where available. |
| `anchors[].name` | string\|null | Scheme or entity name as filed. |
| `anchors[].group_entity` | string\|null | Parent fund house, used for the roll-up. |
| `anchors[].shares_allotted` | integer\|null | Share count. |
| `anchors[].amount_cr` | number\|null | ₹ crore. |
| `anchors[].pct_allocated` | number\|null | Share of the anchor book. |
| `anchors[].pct_allotment_of_issue` | number\|null | Share of the total issue. |
| `groups[]` | array | Aggregated by `group_entity`, largest first. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/ipos/skyways-air-services-ipo/anchors"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "standard",
  "data": {
    "slug": "skyways-air-services-ipo",
    "name": "Skyways Air Services",
    "type": "Mainboard",
    "summary": {
      "total_anchors": 17,
      "total_amount_cr": 174.54,
      "mutual_fund_count": 6,
      "anchor_document": null
    },
    "anchors": [
      {
        "name": "BANK OF INDIA SMALL CAP FUND",
        "group_entity": "BANK OF INDIA MUTUAL FUND",
        "shares_allotted": 1870000,
        "amount_cr": 25.81,
        "pct_allocated": 14.78,
        "pct_allotment_of_issue": 4.43
      }
    ],
    "groups": [
      { "group_entity": "BANK OF INDIA MUTUAL FUND", "anchors": 2, "amount_cr": 49.68 }
    ]
  }
}
```

**Notes**

- Anchor allocation happens one working day before the issue opens, so this returns empty arrays for upcoming issues.


---

## OFS

<a id="ep-ofs-list"></a>

### Offer For Sale issues

```http
GET /api/v2/ofs
```

**Plan:** Pro and above

Every tracked OFS, newest first, with its current subscription.

**Parameters**

| Name | Type | | Description |
|---|---|---|---|
| `limit` | integer | Optional | Cap the number of rows. |

**Response fields**

| Field | Type | Description |
|---|---|---|
| `slug` | string | Identifier for the detail endpoint. |
| `company / short_name` | string | Issuer. |
| `category` | string\|null | Tranche — typically `Retail` or `Non-Retail`. An OFS runs as two tranches on consecutive days. |
| `status` | string | Effective status, computed from the offer dates. |
| `open_date / close_date` | string\|null | ISO timestamps. |
| `floor_price` | number\|null | Floor price in ₹. |
| `discount` | string\|null | Retail discount, as published. |
| `nse_symbol / bse_scripcode` | string\|null | Exchange identifiers. |
| `subscription` | number\|null | Times subscribed from the latest stored snapshot. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/ofs"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "pro",
  "count": 22,
  "data": [
    {
      "slug": "knowledge-realty-trust-retail-sep-2026",
      "company": "Knowledge Realty Trust",
      "short_name": "Knowledge Realty Trust",
      "category": "Retail",
      "status": "closed",
      "open_date": "2026-08-31T18:30:00.000000Z",
      "close_date": "2026-08-31T18:30:00.000000Z",
      "floor_price": 108.51,
      "discount": "0.00",
      "nse_symbol": "KRT",
      "bse_scripcode": "544481",
      "subscription": 0.08
    }
  ]
}
```


<a id="ep-ofs-detail"></a>

### OFS detail and bid book

```http
GET /api/v2/ofs/{slug}
```

**Plan:** Pro and above

One offer with its most recent bid snapshot, including the green-shoe split.

**Parameters**

| Name | Type | | Description |
|---|---|---|---|
| `{slug}` | string | Required | OFS slug. |

**Response fields**

| Field | Type | Description |
|---|---|---|
| `seller` | string\|null | Selling shareholders, as filed. |
| `shares_offered` | string\|null | Base offer size, as published. |
| `exchange` | string\|null | Which exchanges carry the offer. |
| `has_green_shoe` | boolean | Whether an oversubscription option exists. |
| `green_shoe_size` | integer\|null | Green-shoe shares. |
| `book.ltp` | number\|null | Last traded price of the underlying. |
| `book.indicative_price` | number\|null | Indicative clearing price. |
| `book.floor_price` | number\|null | Floor price. |
| `book.base_cutoff` | number\|null | Cut-off on the base issue. |
| `book.gs_cutoff` | number\|null | Cut-off including green shoe. |
| `book.total_qty` | integer\|null | Quantity bid so far. |
| `book.issue_size / gs_issue_size` | integer\|null | Base and green-shoe sizes in shares. |
| `book.subscription_times / gs_subscription_times` | number\|null | Times subscribed, base and with green shoe. |
| `book.status` | string\|null | Exchange-reported state of the book. |
| `book.data_timestamp` | string\|null | When the exchange last published the snapshot. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/ofs/knowledge-realty-trust-retail-sep-2026"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "pro",
  "data": {
    "slug": "knowledge-realty-trust-retail-sep-2026",
    "company": "Knowledge Realty Trust",
    "category": "Retail",
    "status": "closed",
    "floor_price": 108.51,
    "seller": "BREP Asia SG L&T Holding, BREP Asia SG DRPL Holding …",
    "shares_offered": "7,40,00,000",
    "exchange": "BSE / NSE",
    "has_green_shoe": true,
    "green_shoe_size": 37000000,
    "book": {
      "symbol": "KRT",
      "offer_date": "01-Sep-2026",
      "ltp": null,
      "indicative_price": null,
      "floor_price": 108.51,
      "base_cutoff": 108.51,
      "gs_cutoff": 108.51,
      "total_qty": 6049780,
      "issue_size": 74000000,
      "gs_issue_size": 37000000,
      "subscription_times": 0.08,
      "gs_subscription_times": null,
      "status": "Active",
      "data_timestamp": null,
      "updated_at_label": null
    }
  }
}
```

**Notes**

- Reads stored snapshots only. Calling this never triggers a fetch against NSE or BSE, so the freshness you get is the freshness of our last scheduled poll.
- `book` is `null` for offers that never produced a snapshot.


---

## Pre-IPO

<a id="ep-unlisted-list"></a>

### Unlisted / pre-IPO shares

```http
GET /api/v2/unlisted
```

**Plan:** Pro and above

Every tracked unlisted company with its last traded price and 52-week band.

**Parameters**

| Name | Type | | Description |
|---|---|---|---|
| `search` | string | Optional | Matches company name, display name, slug or ISIN (partial, case-insensitive). |

**Response fields**

| Field | Type | Description |
|---|---|---|
| `slug` | string | Identifier for the detail endpoint. |
| `name / display_name` | string | Company name. |
| `sector` | string\|null | Broad sector, where recorded. |
| `isin` | string\|null | ISIN, useful for matching against your own instrument master. |
| `logo` | string\|null | Absolute URL. |
| `ltp` | number\|null | Last traded price in ₹ on the unlisted market. |
| `ltp_updated_at` | string\|null | UTC ISO-8601 time we last refreshed the price (up to three times a day). Not the date of the quote — see `price_date`. |
| `price_date` | string\|null | Date of the quote at the source, `YYYY-MM-DD`. |
| `price_source` | string | `unlistedzone` (scraped daily) or `manual` (entered by our team). |
| `price_type` | string | Always `indicative_dealer_quote`: one indicative price per day from dealers, not an order book, so there is no bid/ask. |
| `is_stale` | boolean | True when there is no price, or the quote is more than 7 days old. Treat a stale price as unreliable. |
| `week_52_high / week_52_low` | number\|null | High and low of the stored daily prices over the trailing year, recalculated on every refresh. |
| `lot_size` | integer\|null | Minimum tradeable quantity. |
| `min_investment` | number\|null | Where recorded. |
| `implied_market_cap_cr` | number\|null | ₹ crore: `ltp` × shares outstanding. Null when the share count is not on file. |
| `dealer_range` | object\|null | `low`, `high`, `median`, `dealers`, `date` — the latest quote from each dealer we track. Only present when at least two dealers quote the company; otherwise `null`. |
| `ipo_status` | string\|null | Coarse listing stage, kept for older integrations: `rumoured`, `drhp_filed`, `sebi_approved`, `ipo_announced`, `listed` or `cancelled`. |
| `ipo_journey_status` | string\|null | Finer stage, derived from SEBI filings and the linked IPO: `rumoured`, `drhp_filed`, `sebi_review_done`, `sebi_approved`, `rhp_filed`, `ipo_announced`, `ipo_open`, `ipo_closed`, `listed`, `approval_lapsed`, `withdrawn` or `cancelled`. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/unlisted"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "pro",
  "count": 206,
  "data": [
    {
      "slug": "jainam-broking",
      "name": "Jainam Broking",
      "display_name": "Jainam Broking",
      "sector": "Financial Services",
      "isin": "INE0JY501027",
      "logo": "https://www.ipoguru.in/storage/unlisted_logos/jainam-broking.webp",
      "ltp": 208,
      "ltp_updated_at": "2026-11-02T09:30:28.000000Z",
      "price_date": "2026-11-02",
      "price_source": "unlistedzone",
      "price_type": "indicative_dealer_quote",
      "is_stale": false,
      "week_52_high": 265,
      "week_52_low": 208,
      "lot_size": 1000,
      "min_investment": 208000,
      "implied_market_cap_cr": 3743.84,
      "dealer_range": { "low": 197, "high": 209, "median": 208, "dealers": 3, "date": "2026-11-02" },
      "ipo_status": "drhp_filed",
      "ipo_journey_status": "drhp_filed"
    }
  ]
}
```

**Notes**

- Unlisted prices come from the grey/unlisted market and are indicative. They are not exchange-traded quotes and carry no regulatory backing.
- Prices refresh at 09:00, 15:00 and 21:00 IST. Dealers usually move a quote at most once a day, and many names go days without a change.
- A company drops out of this list once its IPO lists — it trades on the exchange from then on; use the IPO endpoints for it.
- Some companies have no current quote (`ltp` null, `is_stale` true) because no dealer is quoting them. They stay listed so your instrument master does not churn.


<a id="ep-unlisted-detail"></a>

### Unlisted share detail

```http
GET /api/v2/unlisted/{slug}
```

**Plan:** Pro and above

One company with its valuation snapshot, listing outlook and full price history.

**Parameters**

| Name | Type | | Description |
|---|---|---|---|
| `{slug}` | string | Required | Unlisted share slug. |
| `days` | integer | Optional | Return only the most recent N price readings. Omit for the entire series. |

**Response fields**

| Field | Type | Description |
|---|---|---|
| `sector / sub_sector / isin` | string\|null | Classification. |
| `website / headquarters / founded_year` | string\|null | Company profile. |
| `about` | string\|null | Narrative description. |
| `price.ltp` | number\|null | Last traded price in ₹. |
| `price.updated_at` | string\|null | UTC ISO-8601 time we last refreshed the price. |
| `price.price_date / price_source / price_type / is_stale` | mixed | Quote provenance, as in the list endpoint. |
| `price.week_52_high / week_52_low` | number\|null | Computed from the stored series over the trailing year. |
| `price.face_value / lot_size / min_investment` | mixed | Trading parameters. |
| `price.dealer_range` | object\|null | Low / high / median of the latest quote from each dealer we track, with the dealer count and date. `null` unless at least two dealers quote it. |
| `valuation` | object | `market_cap` (₹ crore), `market_cap_basis`, `shares_outstanding`, `p_e_ratio`, `p_b_ratio`, `roce` — frequently partial. |
| `valuation.market_cap_basis` | string\|null | `ltp_x_shares_outstanding` when the market cap is computed from the live price, `manual` when it is a recorded figure. |
| `ipo` | object | `outlook`, `status`, `journey_status`, `journey_label`, `ipo_url`, `anticipated_year`, `lockin_months`. |
| `ipo.journey_status / journey_label` | string\|null | Where the company is in its listing journey (same values as `ipo_journey_status` in the list) and a human-readable label for it. |
| `ipo.ipo_url` | string\|null | The IPO page on ipoguru.in once the company has a live or listed IPO. |
| `price_history[]` | array | `date`, `price`, `note`. Always oldest first, so it plots directly. |
| `web_url` | string | Canonical page on ipoguru.in. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/unlisted/jainam-broking"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "pro",
  "data": {
    "slug": "jainam-broking",
    "name": "Jainam Broking",
    "sector": "Financial Services",
    "sub_sector": "Stock broking",
    "isin": "INE0JY501027",
    "headquarters": "GIFT City, Gandhinagar, Gujarat",
    "founded_year": "2003",
    "price": {
      "ltp": 208,
      "updated_at": "2026-11-02T09:30:28.000000Z",
      "price_date": "2026-11-02",
      "price_source": "unlistedzone",
      "price_type": "indicative_dealer_quote",
      "is_stale": false,
      "week_52_high": 265,
      "week_52_low": 208,
      "face_value": "2.00",
      "lot_size": 1000,
      "min_investment": 208000,
      "dealer_range": { "low": 197, "high": 209, "median": 208, "dealers": 3, "date": "2026-11-02" }
    },
    "valuation": {
      "market_cap": 3743.84,
      "market_cap_basis": "ltp_x_shares_outstanding",
      "shares_outstanding": 179992515,
      "p_e_ratio": null,
      "p_b_ratio": null,
      "roce": null
    },
    "ipo": {
      "outlook": null,
      "status": "drhp_filed",
      "journey_status": "drhp_filed",
      "journey_label": "DRHP filed with SEBI",
      "ipo_url": null,
      "anticipated_year": null,
      "lockin_months": 6
    },
    "price_history": [
      { "date": "2026-10-30T18:30:00.000000Z", "price": 208, "note": null },
      { "date": "2026-10-31T18:30:00.000000Z", "price": 208, "note": null },
      { "date": "2026-11-01T18:30:00.000000Z", "price": 208, "note": null }
    ],
    "web_url": "https://www.ipoguru.in/pre-ipo-shares/jainam-broking"
  }
}
```

**Notes**

- `days` returns the most recent N readings, then sorts them oldest-first for plotting.
- The 52-week band is computed from the readings we hold, so on a recently added company it widens as history accumulates. After a split, bonus or other change of share basis, readings before it are left out of the band but stay in `price_history`.
- A company whose IPO has listed returns `404`.
- `valuation` fields are strings and often null — these are reported figures, not computed ones.


---

## Account

<a id="ep-me"></a>

### Key introspection

```http
GET /api/v2/me
```

**Plan:** Free (every plan)

What this key is allowed to do, and how much of today is left. Answers most support questions before they are asked.

**Response fields**

| Field | Type | Description |
|---|---|---|
| `name` | string | The client name on the key. |
| `plan` | string | Plan _in force_ — this reads `free` if a paid plan has lapsed. |
| `plan_label` | string | Display name. |
| `expires_at` | string\|null | `YYYY-MM-DD`, or null for a plan that does not lapse. |
| `lapsed` | boolean | True when a paid plan has expired and free limits are being applied. |
| `scopes[]` | array | Scope keys this key can reach. |
| `limits` | object | `per_minute`, `per_day` and `gmp_history_days`. |
| `usage_today` | object | `used`, `remaining` and `resets_at` (IST). |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/me"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "standard",
  "data": {
    "name": "Acme Fintech",
    "plan": "standard",
    "plan_label": "Standard",
    "expires_at": "2027-03-31",
    "lapsed": false,
    "scopes": [
      "calendar", "details", "details_full", "gmp",
      "gmp_history", "subscription", "anchors"
    ],
    "limits": { "per_minute": 20, "per_day": 1000, "gmp_history_days": 90 },
    "usage_today": { "used": 143, "remaining": 857, "resets_at": "23 Sep 2026, 12:00 AM IST" }
  }
}
```

**Notes**

- This call counts against your quota like any other.


<a id="ep-plans"></a>

### Plan catalogue

```http
GET /api/v2/plans
```

**Plan:** Free (every plan)

The published plans, their prices and their scopes — read from the same config the API enforces.

**Response fields**

| Field | Type | Description |
|---|---|---|
| `yearly_months_free` | integer | Months waived when paying annually. |
| `data[].key` | string | Plan key used elsewhere in the API. |
| `data[].price_monthly / price_yearly` | integer | INR. |
| `data[].yearly_saving` | integer | Rupees saved by paying annually. |
| `data[].requests_per_day / requests_per_min` | integer | Limits. |
| `data[].gmp_history_days` | integer\|null | `0` = current reading only, `null` = no ceiling. |
| `data[].scopes[]` | array | What the plan unlocks. |

**Request**

```bash
curl -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/plans"
```

**Response** (trimmed)

```json
{
  "success": true,
  "plan": "free",
  "yearly_months_free": 2,
  "data": [
    {
      "key": "standard",
      "label": "Standard",
      "price_monthly": 299,
      "price_yearly": 2990,
      "currency": "INR",
      "yearly_saving": 598,
      "requests_per_day": 1000,
      "requests_per_min": 20,
      "gmp_history_days": 90,
      "scopes": ["calendar", "details", "details_full", "gmp", "gmp_history", "subscription", "anchors"],
      "blurb": "Day-wise GMP history, live subscription and anchor data."
    }
  ]
}
```


---

IPO data by [IPO Guru](https://www.ipoguru.in/)
