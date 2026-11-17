// Print the current GMP for every open and upcoming IPO. Works on the Free plan.
//
//   export IPOGURU_API_KEY=your_key_here
//   node gmp-today.mjs            # open + upcoming
//   node gmp-today.mjs sme        # SME issues only
//
// Node 18+ (built-in fetch), no npm install needed.
// Run this on a server. Never ship your API key in browser or mobile-app code.

const BASE_URL = 'https://www.ipoguru.in/api/v2';

async function apiGet(path, params = {}) {
  const key = process.env.IPOGURU_API_KEY;
  if (!key) {
    throw new Error('Set IPOGURU_API_KEY first. Get a free key at https://www.ipoguru.in/developer/login');
  }

  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, {
      headers: { 'X-API-KEY': key, Accept: 'application/json', 'User-Agent': 'ipoguru-api-example/1.0' },
    });
    const body = await res.json().catch(() => ({}));

    if (res.ok) {
      const remaining = res.headers.get('X-RateLimit-Remaining');
      if (remaining !== null && Number(remaining) < 3) {
        console.warn(`Warning: only ${remaining} requests left today`);
      }
      return body;
    }

    // Per-minute limit: wait as long as the API says, then try once more.
    if (res.status === 429 && body.error === 'rate_limited' && attempt === 0) {
      const wait = Number(res.headers.get('Retry-After') ?? 60);
      console.warn(`Rate limited, waiting ${wait}s`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }

    // 401/402/403 and the daily quota: retrying will not help.
    throw new Error(`HTTP ${res.status} ${body.error ?? ''}: ${body.message ?? res.statusText}`);
  }
}

const params = process.argv[2] ? { type: process.argv[2] } : {};

try {
  const result = await apiGet('/gmp', params);

  if (result.data.length === 0) {
    console.log('No open or upcoming IPOs right now.');
  } else {
    console.table(
      result.data.map((ipo) => ({
        IPO: ipo.name,
        Board: ipo.type,
        Status: ipo.status,
        Band: ipo.price_band ?? 'TBA',
        GMP: ipo.gmp?.price != null ? `₹${ipo.gmp.price}` : '-',
        'GMP %': ipo.gmp?.percentage != null ? `${ipo.gmp.percentage}%` : '-',
        'Est. listing': ipo.gmp?.estimated_listing_price ?? '-',
        Updated: ipo.gmp?.updated_at_label ?? '-',
      })),
    );
    console.log('GMP is an unofficial grey-market indicator, not investment advice.');
  }
  console.log('IPO data by IPO Guru: https://www.ipoguru.in/');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
