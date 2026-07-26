import "server-only";

import { timingSafeEqual } from "node:crypto";
import { buildWeeklyPilotEmail } from "./weekly-email";

interface GmailConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  senderEmail: string;
  employerName: string;
  employerEmail: string;
  employerFocusAreas: string[];
  cronSecret: string;
}

interface GmailSendResult {
  id?: string;
  threadId?: string;
  error?: {
    message?: string;
  };
}

const envValue = (name: string) => process.env[name]?.trim() || "";

const parseList = (value: string) =>
  [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const maskEmail = (email: string) => {
  const [local = "", domain = ""] = email.split("@");
  if (!local || !domain) return "not configured";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(
    Math.max(2, local.length - visible.length),
  )}@${domain}`;
};

const readConfig = (): GmailConfig => ({
  clientId: envValue("GMAIL_CLIENT_ID"),
  clientSecret: envValue("GMAIL_CLIENT_SECRET"),
  refreshToken: envValue("GMAIL_REFRESH_TOKEN"),
  senderEmail: envValue("GMAIL_SENDER_EMAIL"),
  employerName: envValue("WEEKLY_EMPLOYER_NAME"),
  employerEmail: envValue("WEEKLY_EMPLOYER_EMAIL"),
  employerFocusAreas: parseList(
    envValue("WEEKLY_EMPLOYER_FOCUS_AREAS") ||
      "Technology,Robotics,Engineering",
  ),
  cronSecret: envValue("WEEKLY_CRON_SECRET"),
});

const missingConfig = (config: GmailConfig) =>
  [
    ["clientId", config.clientId],
    ["clientSecret", config.clientSecret],
    ["refreshToken", config.refreshToken],
    ["senderEmail", config.senderEmail],
    ["employerName", config.employerName],
    ["employerEmail", config.employerEmail],
    ["cronSecret", config.cronSecret],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

const requireConfig = () => {
  const config = readConfig();
  const missing = missingConfig(config);
  if (missing.length) {
    throw new Error(
      `Weekly Gmail pilot is missing server configuration: ${missing.join(
        ", ",
      )}.`,
    );
  }
  return config;
};

const safeEqual = (provided: string, expected: string) => {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
};

export function isWeeklyCronAuthorized(authorization: string | null) {
  const expected = envValue("WEEKLY_CRON_SECRET");
  const token =
    authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || "";
  return Boolean(expected && token && safeEqual(token, expected));
}

export function matchesConfiguredPilotEmployerEmail(email: string) {
  const configuredEmail = readConfig().employerEmail;
  return Boolean(
    configuredEmail &&
      normalizeEmail(configuredEmail) === normalizeEmail(email),
  );
}

export function getWeeklyGmailStatus() {
  const config = readConfig();
  const missing = missingConfig(config);

  return {
    configured: missing.length === 0,
    recipient: maskEmail(config.employerEmail),
    sender: maskEmail(config.senderEmail),
    employerName: config.employerName || "MYIN Test Employer",
    focusAreas: config.employerFocusAreas,
    schedule: "Every Monday morning via GitHub Actions",
    dataMode: "Synthetic demo cohort",
    signupMode: "Single configured email-only pilot employer",
    missingCount: missing.length,
  };
}

async function getAccessToken(config: GmailConfig) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Google did not return a Gmail access token.",
    );
  }

  return data.access_token;
}

const cleanHeader = (value: string) =>
  value.replace(/[\r\n]+/g, " ").trim();

const encodeSubject = (subject: string) => {
  const cleaned = cleanHeader(subject);
  return /^[\x00-\x7F]*$/.test(cleaned)
    ? cleaned
    : `=?UTF-8?B?${Buffer.from(cleaned, "utf8").toString("base64")}?=`;
};

const buildRawMessage = ({
  sender,
  recipient,
  subject,
  body,
}: {
  sender: string;
  recipient: string;
  subject: string;
  body: string;
}) => {
  const mime = [
    `From: MYIN <${cleanHeader(sender)}>`,
    `To: ${cleanHeader(recipient)}`,
    `Subject: ${encodeSubject(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
  ].join("\r\n");

  return Buffer.from(mime, "utf8").toString("base64url");
};

async function sendGmailMessage({
  config,
  recipient,
  subject,
  body,
}: {
  config: GmailConfig;
  recipient: string;
  subject: string;
  body: string;
}) {
  const accessToken = await getAccessToken(config);
  const raw = buildRawMessage({
    sender: config.senderEmail,
    recipient,
    subject,
    body,
  });

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ raw }),
      cache: "no-store",
    },
  );

  const data = (await response.json()) as GmailSendResult;

  if (!response.ok || !data.id) {
    throw new Error(
      data.error?.message ||
        "Gmail did not confirm that the message was sent.",
    );
  }

  return data;
}

export async function sendWeeklyPilotEmail() {
  const config = requireConfig();
  const email = buildWeeklyPilotEmail(
    config.employerName,
    config.employerFocusAreas,
  );

  const data = await sendGmailMessage({
    config,
    recipient: config.employerEmail,
    subject: email.subject,
    body: email.body,
  });

  return {
    ok: true,
    messageId: data.id,
    threadId: data.threadId,
    recipient: maskEmail(config.employerEmail),
    subject: email.subject,
    generatedAt: email.generatedAt,
    candidateCount: email.candidateCount,
    gapCount: email.gapCount,
    focusAreas: email.focusAreas,
  };
}

export async function sendPilotSignupConfirmation({
  organizationName,
  email,
}: {
  organizationName: string;
  email: string;
}) {
  const config = requireConfig();

  if (
    normalizeEmail(email) !== normalizeEmail(config.employerEmail)
  ) {
    throw new Error(
      "This hackathon pilot is configured for a different test employer email.",
    );
  }

  const safeOrganizationName =
    cleanHeader(organizationName).slice(0, 80) || config.employerName;

  const subject = "MYIN weekly briefing pilot confirmed";
  const body = [
    `Assalamu alaikum ${safeOrganizationName},`,
    "",
    "Your email-only MYIN pilot signup is confirmed.",
    "",
    `Weekly focus areas: ${config.employerFocusAreas.join(", ")}`,
    "Delivery: Monday morning",
    "Account required: No",
    "",
    "MYIN will send one privacy-safe talent and opportunity-intelligence briefing each week from its central pilot Gmail account.",
    "",
    "Hackathon disclosure: this pilot is currently connected to one preconfigured employer email and uses a synthetic demo cohort. A production version would store employer subscriptions, preferences, consent, and unsubscribe status in a persistent database.",
    "",
    "Jazakum Allahu khayran,",
    "MYIN",
  ].join("\n");

  const data = await sendGmailMessage({
    config,
    recipient: config.employerEmail,
    subject,
    body,
  });

  return {
    ok: true,
    messageId: data.id,
    recipient: maskEmail(config.employerEmail),
    focusAreas: config.employerFocusAreas,
  };
}
