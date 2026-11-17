# curl examples

Put your key in an environment variable once, so it never ends up in your shell history or a script you share:

```bash
export IPOGURU_API_KEY=your_key_here
```

`jq` is optional but makes the output readable (`sudo apt install jq` / `brew install jq`).

## Free plan

```bash
# What can my key do, and how much of today's quota is left?
curl -s -H "X-API-KEY: $IPOGURU_API_KEY" https://www.ipoguru.in/api/v2/me | jq

# Current GMP for every open IPO
curl -s -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/gmp?status=open" | jq

# Upcoming SME IPOs: name, price band, GMP
curl -s -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/ipos?type=sme&status=upcoming" \
  | jq -r '.data[] | [.name, .price_band, .gmp.price] | @tsv'

# Find an IPO's slug by name, then fetch its detail page
curl -s -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/ipos?search=skyways" | jq -r '.data[].slug'
curl -s -H "X-API-KEY: $IPOGURU_API_KEY" https://www.ipoguru.in/api/v2/ipos/skyways-air-services-ipo | jq
```

## Standard plan and above

```bash
# Live subscription by category (QIB / NII / Retail ...)
curl -s -H "X-API-KEY: $IPOGURU_API_KEY" https://www.ipoguru.in/api/v2/ipos/skyways-air-services-ipo/subscription \
  | jq -r '.data.categories[] | [.label, .times] | @tsv'

# Day-wise GMP trend, ready to chart
curl -s -H "X-API-KEY: $IPOGURU_API_KEY" https://www.ipoguru.in/api/v2/ipos/skyways-air-services-ipo/gmp/history \
  | jq -r '.data.trend[] | [.date, .price_value] | @csv'

# Anchor investors grouped by fund house
curl -s -H "X-API-KEY: $IPOGURU_API_KEY" https://www.ipoguru.in/api/v2/ipos/skyways-air-services-ipo/anchors \
  | jq '.data.groups'
```

## Pro plan

```bash
# Day-by-day subscription build-up
curl -s -H "X-API-KEY: $IPOGURU_API_KEY" https://www.ipoguru.in/api/v2/ipos/skyways-air-services-ipo/subscription/history | jq

# Offer For Sale issues
curl -s -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/ofs?limit=5" | jq

# Unlisted / pre-IPO share prices, search by name or ISIN
curl -s -H "X-API-KEY: $IPOGURU_API_KEY" "https://www.ipoguru.in/api/v2/unlisted?search=jainam" | jq
```

## See the quota headers

```bash
curl -s -D - -o /dev/null -H "X-API-KEY: $IPOGURU_API_KEY" https://www.ipoguru.in/api/v2/me | grep -i '^x-'
# x-plan: free
# x-ratelimit-limit: 10
# x-ratelimit-remaining: 7
```

The slugs above are real past IPOs. Swap in a current one from `/ipos`.
