#!/usr/bin/env python3
"""Print the current GMP for every open and upcoming IPO. Works on the Free plan.

    export IPOGURU_API_KEY=your_key_here
    python3 gmp_today.py            # open + upcoming
    python3 gmp_today.py sme        # SME issues only

Standard library only, no pip install needed (Python 3.8+).
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE_URL = "https://www.ipoguru.in/api/v2"


def api_get(path, params=None):
    """GET an endpoint and return the parsed JSON body. Exits with the API's error message on failure."""
    key = os.environ.get("IPOGURU_API_KEY")
    if not key:
        sys.exit("Set IPOGURU_API_KEY first. Get a free key at https://www.ipoguru.in/developer/login")

    url = BASE_URL + path
    if params:
        url += "?" + urllib.parse.urlencode(params)

    request = urllib.request.Request(url, headers={
        "X-API-KEY": key,
        "Accept": "application/json",
        "User-Agent": "ipoguru-api-example/1.0",
    })

    for attempt in range(2):
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                remaining = response.headers.get("X-RateLimit-Remaining")
                if remaining is not None and int(remaining) < 3:
                    print(f"Warning: only {remaining} requests left today", file=sys.stderr)
                return json.load(response)
        except urllib.error.HTTPError as error:
            try:
                body = json.loads(error.read() or b"{}")
            except ValueError:
                body = {}
            # Per-minute limit: wait as long as the API says, then try once more.
            if error.code == 429 and body.get("error") == "rate_limited" and attempt == 0:
                wait = int(error.headers.get("Retry-After", 60))
                print(f"Rate limited, waiting {wait}s", file=sys.stderr)
                time.sleep(wait)
                continue
            # 401/402/403 and the daily quota: retrying will not help.
            sys.exit(f"HTTP {error.code} {body.get('error', '')}: {body.get('message', error.reason)}")


def main():
    params = {}
    if len(sys.argv) > 1:
        params["type"] = sys.argv[1]  # mainboard | sme

    result = api_get("/gmp", params)
    rows = result["data"]

    if not rows:
        print("No open or upcoming IPOs right now.")
        return

    print(f"{'IPO':<34} {'Board':<9} {'Status':<9} {'Band':<11} {'GMP':>7} {'GMP %':>7} {'Est. listing':>12}  Updated")
    for ipo in rows:
        gmp = ipo["gmp"] or {}
        price = gmp.get("price")
        pct = gmp.get("percentage")
        est = gmp.get("estimated_listing_price")
        print(
            f"{ipo['name'][:33]:<34} {ipo['type']:<9} {ipo['status']:<9} {(ipo.get('price_band') or 'TBA'):<11} "
            f"{('₹' + price) if price is not None else '-':>7} "
            f"{(pct + '%') if pct is not None else '-':>7} "
            f"{('₹' + str(est)) if est is not None else '-':>12}  "
            f"{gmp.get('updated_at_label') or '-'}"
        )

    print(f"\n{len(rows)} IPOs on the {result['plan']} plan. GMP is an unofficial grey-market indicator, not investment advice.")
    print("IPO data by IPO Guru: https://www.ipoguru.in/")


if __name__ == "__main__":
    main()
