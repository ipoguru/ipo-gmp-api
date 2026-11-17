# Examples

Each example prints the current GMP for open and upcoming IPOs, so all of them work on the **Free plan**. They handle the per-minute `429` by waiting `Retry-After`, stop on errors retrying can't fix, and print the required attribution.

| Folder | Run it | Needs |
|---|---|---|
| [curl](curl) | copy a command | curl, optionally jq |
| [python](python) | `python3 gmp_today.py` | Python 3.8+, no packages |
| [javascript](javascript) | `node gmp-today.mjs` | Node 18+, no packages |
| [php](php) | `php gmp-today.php` | PHP 7.4+ with curl |
| [google-sheets](google-sheets) | paste into Apps Script | a Google account |

All of them read the key from the `IPOGURU_API_KEY` environment variable (Sheets uses Script properties):

```bash
export IPOGURU_API_KEY=your_key_here
```

Don't have a key? [Sign up free](https://www.ipoguru.in/developer/login).

**Never commit your key.** This repo's `.gitignore` already ignores `.env`; copy [`.env.example`](../.env.example) to `.env` if you prefer a file.
