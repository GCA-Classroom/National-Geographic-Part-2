# National-Geographic-Part-2
# Country Explorer, Part 2: Ask the Field Guide

Code for the National Geographic APIs P2 LiveLab. Each folder is a complete, runnable version of the site.

| Folder | Becomes | Contains |
| --- | --- | --- |
| `starter/` | Student Repo | Part 1 finished + TODOs for Steps 1-6, stretch Steps 7-10 described |
| `main/` | Instructor Demo Repo, `main` branch | Steps 1-6 complete |
| `solution/` | Instructor Demo Repo, `SOLUTION` branch | Steps 1-10 complete |
| `worker.js` | Cloudflare Worker | OpenAI proxy that accepts `{ messages }` and returns OpenAI's JSON |

## Setup

1. Deploy `worker.js` as a Cloudflare Worker and add the secret `OPENAI_API_KEY`.
2. Paste the worker URL into `WORKER_URL` in `script.js`.
3. Add the REST Countries v5 key in `fetchCountry()` (same as Part 1).
4. Open `index.html` with Live Preview in Codespaces.
