<?php
/**
 * Print the current GMP for every open and upcoming IPO. Works on the Free plan.
 *
 *   export IPOGURU_API_KEY=your_key_here
 *   php gmp-today.php            # open + upcoming
 *   php gmp-today.php sme        # SME issues only
 *
 * PHP 7.4+ with the curl extension.
 */

const BASE_URL = 'https://www.ipoguru.in/api/v2';

function ipoguru_get(string $path, array $params = []): array
{
    $key = getenv('IPOGURU_API_KEY');
    if (!$key) {
        fwrite(STDERR, "Set IPOGURU_API_KEY first. Get a free key at https://www.ipoguru.in/developer/login\n");
        exit(1);
    }

    $url = BASE_URL . $path . ($params ? '?' . http_build_query($params) : '');

    for ($attempt = 0; $attempt < 2; $attempt++) {
        $headers = [];
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 20,
            CURLOPT_HTTPHEADER     => ['X-API-KEY: ' . $key, 'Accept: application/json', 'User-Agent: ipoguru-api-example/1.0'],
            CURLOPT_HEADERFUNCTION => function ($ch, $line) use (&$headers) {
                $parts = explode(':', $line, 2);
                if (count($parts) === 2) {
                    $headers[strtolower(trim($parts[0]))] = trim($parts[1]);
                }
                return strlen($line);
            },
        ]);
        $raw    = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error  = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            fwrite(STDERR, "Network error: $error\n");
            exit(1);
        }

        $body = json_decode($raw, true) ?: [];

        if ($status === 200) {
            if (isset($headers['x-ratelimit-remaining']) && (int) $headers['x-ratelimit-remaining'] < 3) {
                fwrite(STDERR, "Warning: only {$headers['x-ratelimit-remaining']} requests left today\n");
            }
            return $body;
        }

        // Per-minute limit: wait as long as the API says, then try once more.
        if ($status === 429 && ($body['error'] ?? '') === 'rate_limited' && $attempt === 0) {
            $wait = (int) ($headers['retry-after'] ?? 60);
            fwrite(STDERR, "Rate limited, waiting {$wait}s\n");
            sleep($wait);
            continue;
        }

        // 401/402/403 and the daily quota: retrying will not help.
        fwrite(STDERR, "HTTP $status " . ($body['error'] ?? '') . ': ' . ($body['message'] ?? 'request failed') . "\n");
        exit(1);
    }
}

$params = isset($argv[1]) ? ['type' => $argv[1]] : [];
$result = ipoguru_get('/gmp', $params);

if (!$result['data']) {
    echo "No open or upcoming IPOs right now.\n";
}

foreach ($result['data'] as $ipo) {
    $gmp = $ipo['gmp'] ?? [];
    printf(
        "%-34s %-9s %-9s %-11s GMP %-8s %-8s est. %-9s %s\n",
        mb_substr($ipo['name'], 0, 33),
        $ipo['type'],
        $ipo['status'],
        $ipo['price_band'] ?? 'TBA',
        isset($gmp['price']) ? '₹' . $gmp['price'] : '-',
        isset($gmp['percentage']) ? $gmp['percentage'] . '%' : '-',
        isset($gmp['estimated_listing_price']) ? '₹' . $gmp['estimated_listing_price'] : '-',
        $gmp['updated_at_label'] ?? '-'
    );
}

echo "\nGMP is an unofficial grey-market indicator, not investment advice.\n";
echo "IPO data by IPO Guru: https://www.ipoguru.in/\n";
