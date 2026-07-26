export function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseRobots(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.split("#")[0].trim());
  let applies = false;
  for (const line of lines) {
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") applies = value === "*" || /myin/i.test(value);
    if (applies && key === "disallow" && value === "/") return false;
  }
  return true;
}

function privateHostname(hostname: string) {
  const host = hostname.toLowerCase();
  return /^(localhost|0\.0\.0\.0|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|169\.254(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|::1)$/.test(host) || host.endsWith(".local");
}

export async function fetchPublicOrganizationPage(rawUrl: string) {
  const url = new URL(rawUrl);
  if (!/^https?:$/.test(url.protocol)) throw new Error("Only public HTTP(S) URLs are supported.");
  if (privateHostname(url.hostname)) throw new Error("Local or private network URLs are not allowed.");

  const robotsUrl = new URL("/robots.txt", url.origin);
  try {
    const robots = await fetch(robotsUrl, {
      headers: { "User-Agent": "MYIN-Hackathon-Demo/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (robots.ok && !parseRobots(await robots.text())) throw new Error("This site’s robots policy does not allow this automated request.");
  } catch (error) {
    if (error instanceof Error && /robots policy/.test(error.message)) throw error;
  }

  const response = await fetch(url, {
    headers: { "User-Agent": "MYIN-Hackathon-Demo/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`The public page returned ${response.status}.`);
  const finalUrl = new URL(response.url);
  if (privateHostname(finalUrl.hostname)) throw new Error("The page redirected to a local or private network address.");
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html") && !type.includes("text/plain")) throw new Error("Only public text or HTML pages are supported in this demo.");
  const html = (await response.text()).slice(0, 250_000);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || url.hostname;
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] || "";
  return {
    requestedUrl: rawUrl,
    finalUrl: response.url,
    title,
    description,
    text: stripHtml(html).slice(0, 20_000),
  };
}
