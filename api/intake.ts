/**
 * Veye Media Intake API (Google Workspace SMTP, email-only)
 * Endpoint: /api/intake
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export const config = { maxDuration: 10 };

// If you want strict CORS, keep your allowlist.
// If your portal and API are same-origin, you can remove CORS entirely.
const ALLOWED_ORIGINS = new Set<string>([
  "https://www.veyemedia.co",
  "https://veye-portal.vercel.app", // replace with your real domain if different
]);

function setCors(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });

  // Required SMTP env vars
  const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
  const SMTP_PORT = Number(process.env.SMTP_PORT || "587");
  const SMTP_USER = process.env.SMTP_USER; // victor@veyemedia.co
  const SMTP_PASS = process.env.SMTP_PASS; // Google App Password
  const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "victor@veyemedia.co";

  if (!SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({ ok: false, message: "Missing SMTP_USER or SMTP_PASS" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const {
      fullName,
      organization, // matches your original intake fields
      email,
      message,
      priority = "Normal",
      deadline = "Not specified",
    } = payload ?? {};

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
      secure: SMTP_PORT === 465, // 465 = SSL, 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

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

    const info = await transporter.sendMail({
      from: `Veye Portal <${SMTP_USER}>`,
      to: TO_EMAIL,
      replyTo: cleanEmail,
      subject: `[${priority}] Service Request: ${cleanOrg}`,
      html,
    });

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
    });
  }
}
