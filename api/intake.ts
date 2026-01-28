/**
 * Veye Media Intake API (Google Workspace SMTP, email-only)
 * Endpoint: /api/intake
 *
 * Authenticates via SMTP_USER (victor@veyemedia.co) and presents mail "From" as portal@ alias.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export const config = { maxDuration: 10 };

const ALLOWED_ORIGINS = new Set<string>([
  "https://www.veyemedia.co",
  "https://veye-client-service-portal-1szn3.vercel.app",
]);

const DEFAULT_TO = "victor@veyemedia.co";
const DEFAULT_HOST = "smtp.gmail.com";
const DEFAULT_PORT = 587;

// Visible sender (alias). This does NOT need to authenticate.
const MAIL_FROM = "Veye Portal <portal@veyemedia.co>";

function setCors(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;

  if (
    origin &&
    (ALLOWED_ORIGINS.has(origin) ||
      origin.endsWith(".vercel.app"))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function escapeHtml(input: unknown) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const SMTP_HOST = process.env.SMTP_HOST || DEFAULT_HOST;
  const SMTP_PORT = Number(process.env.SMTP_PORT || DEFAULT_PORT);
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const TO_EMAIL = process.env.CONTACT_TO_EMAIL || DEFAULT_TO;

  if (!SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({
      ok: false,
      message: "Missing SMTP_USER or SMTP_PASS in environment variables.",
    });
  }

  try {
    console.log("INTAKE: reached handler", {
      method: req.method,
      origin: req.headers.origin,
      hasBody: !!req.body,
    });

    console.log("INTAKE: raw body type", typeof req.body);
    console.log("INTAKE: raw body preview", JSON.stringify(req.body).slice(0, 400));

    const {
      fullName,
      organization,
      email,
      message,
      priority = "Normal",
      deadline = "Not specified",
    } = (req.body || {}) as Record<string, unknown>;

    console.log("INTAKE: body keys", req.body ? Object.keys(req.body) : null);

    if (!fullName || !organization || !email || !message) {
      return res.status(400).json({
        ok: false,
        message: "Missing required fields: fullName, organization, email, message",
      });
    }

    const cleanName = String(fullName).trim();
    const cleanOrg = String(organization).trim();
    const cleanEmail = String(email).trim();
    const cleanMsg = String(message).trim();

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });

    console.log("INTAKE: verifying SMTP", { SMTP_HOST, SMTP_PORT, SMTP_USER, TO_EMAIL });
    await transporter.verify();
    console.log("INTAKE: SMTP verified");

    const html = `
      <h2>New Service Request</h2>
      <p><strong>From:</strong> ${escapeHtml(cleanName)} (${escapeHtml(cleanEmail)})</p>
      <p><strong>Organization:</strong> ${escapeHtml(cleanOrg)}</p>
      <p><strong>Priority:</strong> ${escapeHtml(priority)}</p>
      <p><strong>Deadline:</strong> ${escapeHtml(deadline)}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(cleanMsg)}</p>
    `;

    console.log("INTAKE: about to sendMail");
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      sender: SMTP_USER,
      to: TO_EMAIL,
      replyTo: cleanEmail,
      subject: `[${String(priority)}] Service Request: ${cleanOrg}`,
      html,
    });

    console.log("INTAKE: sendMail result", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    if (!info.accepted || info.accepted.length === 0) {
      return res.status(502).json({
        ok: false,
        message: "SMTP send returned no accepted recipients.",
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Intake emailed successfully.",
      id: info.messageId,
    });
  } catch (err: any) {
    console.error("SMTP send error:", err);
    return res.status(502).json({
      ok: false,
      message: "SMTP send failed",
      error: err?.message || String(err),
      code: err?.code,
      responseCode: err?.responseCode,
    });
  }
}
