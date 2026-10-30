# TPA Intimation Generator

Parses claim messages and translates Gujarati diagnoses using Groq. Review all extracted details before sending an email.

## Run Locally

1. Run `npm install`.
2. Set `GROQ_API_KEY` in `.env.local` or the server environment. Optionally set `GROQ_MODEL` (default: `openai/gpt-oss-120b`, using low reasoning effort for this extraction task).
3. Run `npm run dev` and open `http://localhost:3000`. Set `PORT` to use another port.

The Node server handles `/api/groq`; the API key is never embedded in the browser bundle. Do not run Vite directly. Restart the server after changing environment variables. `.env.local` is ignored by Git.

## Production

Run `npm run build`, then `npm start`. The Node server serves both the built app and API. A static-only deployment will not support AI requests. Configure authentication and rate limits before exposing the API publicly; claim details are sent to Groq when parsing or translating.

`npm run preview` runs the same production server. Use Enter Manually when the provider is unavailable.
