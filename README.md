# Rate Radar

A live currency converter for East African travel. Convert between KES, RWF, UGX, TZS, USD, EUR and GBP using real-time exchange rates, keep a history of conversions, and filter or sort them.

**Live app (via load balancer):** http://3.9.176.132/rate-radar
**Demo video link: https://youtu.be/N0iuqamZCoA

## Why this app
I'm a Kenyan student in Kigali, and every trip home crosses Rwanda, Uganda and Kenya, three currencies in a day and a half. Prices at borders and bus stations are quoted in whichever currency suits the seller, so I wanted a quick, honest converter that works on a phone and remembers what I've already checked.

## Features
- Live rates from an external REST API
- Swap currencies with one click
- Conversion history (last 20), filterable by currency code, sortable by time, amount or result
- Clear error message if the API is unreachable (no crash, no blank screen)
- Responsive layout for phone and desktop

## API used
**ExchangeRate-API (open endpoint)** — https://www.exchangerate-api.com/docs/free
Endpoint: `https://open.er-api.com/v6/latest/{BASE}` returns JSON rates for 160+ currencies.
No API key is required for the open endpoint, so there are no credentials to expose in a client-side app. [One sentence on why you chose it over a keyed API.]

I chose the open endpoint because it needs no API key, so there is nothing to leak from a browser-only app, and because it covers all four East African currencies, which most free rateAPIs don't.

## Run locally
1. Clone: `git clone https://github.com/ikariuki-crypto/rate-radar.git`
2. Open `index.html` in a browser. No build step, no dependencies.

## Deployment
Two Nginx web servers (web-01, web-02) behind an HAProxy load balancer (lb-01), round-robin.

1. Nginx installed on both web servers with a custom `X-Served-By` header (see `alu-system_engineering-devops/load_balancer/0-custom_http_response_header`).
2. HAProxy on lb-01 configured with both servers as a round-robin backend (`1-install_load_balancer`).
3. App files copied to `/var/www/html/rate-radar/` on both servers with `deploy.sh`.

Verify balancing:
```
curl -sI 3.9.176.132/rate-radar/ | grep -i x-served-by   # 7320-web-01
curl -sI 3.9.176.132/rate-radar/ | grep -i x-served-by   # 7320-web-02
```

## Challenges
1. The error path looked broken. When I disconnected wifi to test error handling, the browser served the API response from cache, so no error appeared. Adding { cache: "no-store" } to the fetch fixed it and also guarantees live rates.
2. HAProxy lowercases headers. My grep X-Served-By check returned nothing through the load balancer until I used grep -i; HAProxy had rewritten the header to x-served-by.
3. Not breaking the formative checkers. The web servers' root page must keep returning "Holberton School" for earlier project checks, so I deployed the app to /rate-radar/ instead of overwriting index.html.
4. No HTTPS yet. The app is served over HTTP; SSL termination on the load balancer is planned once a domain is attached (certbot + HAProxy).

## Credits
- Exchange rates: ExchangeRate-API (https://www.exchangerate-api.com)
- Servers: ALU-provided Ubuntu 20.04 instances
- Built by Isaack Muiruri Kariuki, African Leadership University.
- Built with step-by-step guidance from an AI assistant (Claude) in a separate chat; all code typed, debugged and deployed by me.