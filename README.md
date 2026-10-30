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

## Vercel

The Vite frontend is deployed from `dist`, and `api/groq.ts` exposes the shared Express API as a Vercel Function. `vercel.json` configures the build and a 60-second function limit; upstream Groq requests time out after 30 seconds.

1. Import the repository in Vercel using the Vite preset. Use `npm run build` and output directory `dist` (already set in `vercel.json`).
2. Add `GROQ_API_KEY` as a sensitive server environment variable for Production and any Preview environments you use. Never prefix it with `VITE_`.
3. Optionally add `GROQ_MODEL=openai/gpt-oss-120b`.
4. Deploy the updated code. After changing environment variables, redeploy; changing them alone does not update an existing deployment.

The deployed project must include the API function, not only an uploaded `dist` folder. Tailwind is compiled locally into the build; the browser does not load the Tailwind CDN script.
