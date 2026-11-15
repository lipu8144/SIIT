/**
 * SIIT — Email integration stub (Phase 5)
 * ─────────────────────────────────────────────────────────────
 * Primary:  Resend (https://resend.com) — simple API, free tier.
 * Fallback: Nodemailer with SMTP (Gmail / custom SMTP).
 *
 * TO GO LIVE WITH RESEND:
 *   1. Sign up at resend.com → get API key.
 *   2. Verify your sending domain (e.g. mail.siit.in).
 *   3. In .env:
 *        VITE_EMAIL_PROVIDER="resend"        ← or "smtp"
 *        VITE_RESEND_API_KEY="re_xxxxx"
 *        VITE_EMAIL_FROM="SIIT <no-reply@siit.in>"
 *   4. Uncomment the fetch block in _sendResend() below.
 *   NOTE: API keys must NOT be in the browser bundle.
 *   Call this from a Supabase Edge Function or a backend route.
 *
 * TO GO LIVE WITH SMTP (Nodemailer — server-side only):
 *   VITE_EMAIL_PROVIDER="smtp"
 *   VITE_SMTP_HOST / VITE_SMTP_PORT / VITE_SMTP_USER / VITE_SMTP_PASS
 *   Then call from a Node server / Edge Function.
 *
 * Usage:
 *   import { email } from "../lib/email";
 *   await email.send({ to: "student@example.com", subject: "Welcome", html: "<p>Hi!</p>" });
 *   await email.sendWelcome({ to, name, course });
 */

const PROVIDER  = import.meta.env.VITE_EMAIL_PROVIDER  || "stub";
const API_KEY   = import.meta.env.VITE_RESEND_API_KEY  || "";
const FROM      = import.meta.env.VITE_EMAIL_FROM      || "SIIT <no-reply@siit.in>";

async function _sendResend({ to, subject, html }) {
  if (!API_KEY) {
    console.warn("[Email stub] Resend key not set — email not sent:", { to, subject });
    return { status: "stub" };
  }
  // UNCOMMENT when ready:
  // const res = await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
  //   body: JSON.stringify({ from: FROM, to, subject, html }),
  // });
  // if (!res.ok) throw new Error(await res.text());
  // return res.json();
}

async function _send(opts) {
  if (PROVIDER === "resend") return _sendResend(opts);
  // SMTP: handled server-side via Nodemailer — stub here
  console.warn("[Email stub] No provider configured:", opts);
  return { status: "stub" };
}

/* ── Shared HTML layout ─────────────────────────────────────  */
const layout = (body) => `
<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#edf4ff;padding:24px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#1c3fbd,#3457d6);padding:24px;text-align:center">
    <span style="font-size:32px;color:#fff;font-family:Georgia,serif">
      S<span style="color:#ff7ba1">i</span><span style="color:#ffc59a">i</span><span style="color:#a9e0ff">T</span>
    </span>
    <div style="color:rgba(255,255,255,.8);font-size:13px;margin-top:4px">Smart Institute of Information Technology</div>
  </div>
  <div style="padding:28px 24px">${body}</div>
  <div style="background:#f0f4ff;padding:16px 24px;text-align:center;font-size:12px;color:#42506a">
    SIIT · Main Road, Sorada, Ganjam, Odisha · +91 7873987123 · siitsurada@gmail.com
  </div>
</div></body></html>`;

export const email = {
  /** Raw send — pass any html */
  send: _send,

  async sendWelcome({ to, name, course }) {
    return _send({ to, subject: `Welcome to SIIT, ${name}!`,
      html: layout(`<h2 style="color:#1c3fbd">Welcome, ${name}!</h2>
        <p>We're excited to have you join the <strong>${course}</strong> batch at SIIT.</p>
        <p>Your enrollment is confirmed. Our team will reach out with batch timings soon.</p>
        <a href="https://siit.in" style="display:inline-block;margin-top:16px;background:#eb0249;color:#fff;padding:10px 22px;border-radius:999px;text-decoration:none;font-weight:500">Visit SIIT</a>`) });
  },

  async sendResultNotification({ to, name, grade, average }) {
    return _send({ to, subject: "Your SIIT Result is Published",
      html: layout(`<h2 style="color:#1c3fbd">Result Published</h2>
        <p>Dear ${name}, your result for the recently completed course at SIIT is now available.</p>
        <div style="background:#f0f4ff;border-radius:12px;padding:16px;margin:16px 0;text-align:center">
          <div style="font-size:36px;font-weight:bold;color:#1c3fbd">${average}%</div>
          <div style="font-size:18px;font-weight:bold;color:#eb0249">${grade}</div>
        </div>
        <p>Login to your student portal to view your full report card and download it.</p>`) });
  },

  async sendEventReminder({ to, name, eventTitle, date, location }) {
    return _send({ to, subject: `Reminder: ${eventTitle} at SIIT`,
      html: layout(`<h2 style="color:#1c3fbd">Event Reminder</h2>
        <p>Dear ${name}, this is a reminder for the upcoming event:</p>
        <div style="background:#f0f4ff;border-radius:12px;padding:16px;margin:16px 0">
          <div style="font-size:18px;font-weight:bold">${eventTitle}</div>
          <div style="color:#42506a;margin-top:6px">📅 ${date} &nbsp; 📍 ${location}</div>
        </div>
        <p>We look forward to seeing you there!</p>`) });
  },

  async sendAdmissionConfirmation({ to, name, enrollmentNo, course, batch }) {
    return _send({ to, subject: "Admission Confirmed — SIIT",
      html: layout(`<h2 style="color:#1c3fbd">Admission Confirmed!</h2>
        <p>Dear ${name}, your admission to SIIT has been successfully confirmed.</p>
        <div style="background:#f0f4ff;border-radius:12px;padding:16px;margin:16px 0">
          <div><strong>Enrollment No:</strong> ${enrollmentNo}</div>
          <div><strong>Course:</strong> ${course}</div>
          <div><strong>Batch:</strong> ${batch}</div>
        </div>
        <p>Please carry a copy of this email on your first day. See you soon!</p>`) });
  },

  async sendNewsletter({ to, subject, content }) {
    return _send({ to, subject, html: layout(`<div>${content}</div>`) });
  },
};
