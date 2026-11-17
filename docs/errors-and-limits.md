<!-- Generated from the live API reference. Edit the source on the server and re-run the export, not this file. -->
# Errors, limits and headers

## Rate limits

Every key has two limits, a per-minute burst limit and a daily quota. The daily quota resets at **midnight IST**.

| Plan | Requests / minute | Requests / day |
|---|---|---|
| Free | 1 | 10 |
| Basic | 10 | 250 |
| Standard | 20 | 1,000 |
| Pro | 40 | 3,000 |

Every call counts, including `/me`, `/plans` and calls that return an error from the endpoint itself.

## Response headers

| Header | Meaning |
|---|---|
| `X-Plan` | The plan in force for this key (`free` if a paid plan has lapsed). |
| `X-RateLimit-Limit` | Your daily quota. |
| `X-RateLimit-Remaining` | Requests left today. Back off when it gets low. |
| `Retry-After` | Sent with a per-minute `429`: seconds until you may call again. |

## Error format

Every error is JSON with `success: false`, a stable machine-readable `error` code and a human `message`. Switch on `error`, not on `message`.

```json
{
  "success": false,
  "error": "invalid_key",
  "message": "Invalid or inactive API key."
}
```

| HTTP | `error` | When | What to do |
|---|---|---|---|
| 401 | `missing_key` | No `X-API-KEY` header or `api_key` parameter. | Send the header. |
| 403 | `invalid_key` | The key is wrong, regenerated or paused. | Check the key in the portal. If you regenerated it, the old one stops working at once. |
| 402 | `plan_upgrade_required` | Your plan does not include this endpoint. The body names `required_scope`, `your_plan`, `upgrade_to` and an `upgrade` link. | Upgrade, or stop calling the endpoint. Retrying will not help. |
| 429 | `rate_limited` | Over the per-minute limit. Includes `retry_after` (seconds) and a `Retry-After` header. | Wait `Retry-After` seconds, then retry. |
| 429 | `daily_quota_reached` | Daily quota used up. Includes `resets_at` (IST) and an `upgrade` link. | Stop until `resets_at`; don't retry in a loop. |
| 404 | | Unknown slug, or an unlisted company whose IPO has now listed. | Re-read the slug from the list endpoint. |
| 422 | | An invalid filter value, for example `status=foo`. | Fix the parameter. |

Example `402`:

```json
{
  "success": false,
  "error": "plan_upgrade_required",
  "message": "Live subscription by category is not included in the Free plan. Upgrade to Standard to access it.",
  "required_scope": "subscription",
  "your_plan": "free",
  "upgrade_to": "standard",
  "upgrade": "https://www.ipoguru.in/ipo-gmp-details-developer-api#pricing"
}
```

A Free key calling `GET /ipos/{slug}` gets a `200`, not a `402`: the paid sections are left out and a `locked` block names them.

## When a paid plan lapses

The key keeps working on the Free plan's limits and scopes. `GET /me` shows `"lapsed": true` and the expiry date. Renew in the [developer portal](https://www.ipoguru.in/developer/login) and the paid scopes come back as soon as the payment is approved.

## Retry pattern

1. On `429 rate_limited`, sleep for `Retry-After` seconds and retry once.
2. On `429 daily_quota_reached`, `402` or `403`, don't retry. Surface the problem.
3. On `5xx` or a network error, retry with backoff (for example 2 s, then 8 s), then fall back to your cached copy.
