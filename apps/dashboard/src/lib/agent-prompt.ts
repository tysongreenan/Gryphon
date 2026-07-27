import { PROD_API_URL, type SetupState, hasApiKey } from "@/lib/setup";

/**
 * One pasteable prompt — copy → give to your agent.
 */
export function buildAgentPrompt(state: SetupState): string {
  const apiUrl = (state.apiUrl || PROD_API_URL).replace(/\/$/, "");
  const keyLine = hasApiKey(state)
    ? `API key: ${state.apiKey.trim()}`
    : `API key: use GRYPHON_API_KEY from the environment / monorepo apps/api/.env if present, otherwise ask me once.`;

  return `You have Gryphon for authenticated browser sessions.

## How Gryphon works (important)
- Humans sign in once in a remote browser (Live View). Gryphon saves the **browser session** (cookies), not passwords.
- Agents never receive username/password. They call get_session and get a connect_url for a browser that is already logged in.
- Do not invent credentials or scrape password fields.

## Tools
- get_session(site, start_url?) — always call first. Pass start_url = the login page when known.
- request_human_auth(site, reason) — login wall mid-task
- get_escalation_status(escalation_id) — poll after needs_auth

## Always
1. get_session first. Use stable site keys (websitefeedback, wordpress, linkedin, …).
2. Pass start_url when you know the login page (e.g. https://websitefeedback.ca/login) so Live View opens there.
3. status=ready → use connect_url (Playwright CDP). Don't hardcode old URLs.
4. status=needs_auth → STOP. Give me resolve_url immediately. I log in in Live View, mark resolved. Poll get_session until ready.
5. You still do the actual site work after auth is ready.

## My Gryphon
URL: ${apiUrl}
${keyLine}

## If MCP tools are missing
Wire Gryphon MCP, restart this host, then continue.
Monorepo: ./scripts/setup_mcp.sh
env GRYPHON_API_URL=${apiUrl} and GRYPHON_API_KEY.

## Start
Call get_session for the site I care about. Prefer start_url for the login page. If needs_auth, paste resolve_url — don't only ask which site.`;
}
