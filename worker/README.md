# Diet API (Claude)

Cloudflare Worker that turns the theme's diet form into a personalized plan using Claude. The API key stays on the server; the theme never sees it.

## Deploy
1. `cd worker && npm install`
2. Edit `wrangler.toml`: set `ALLOWED_ORIGIN` to your store origin (and `MODEL` if you want a cheaper model, e.g. `claude-sonnet-5-5`).
3. `npx wrangler secret put ANTHROPIC_API_KEY`
4. `npx wrangler deploy`
5. Put the worker URL in `src/views/pages/diet-plan.twig` as `data-api-url="https://diet-api.<you>.workers.dev"`.

If the API is empty, down, or returns an error, the page falls back to the built-in calculator.

## Notes
- Requests use low effort and a 4000-token cap. Add Cloudflare rate limiting (WAF rule) on the worker route to cap abuse and cost.
- Server-side refusal fallback to `claude-opus-4-8` is enabled.
- Tests (no network, mocked client): `npm test`.
