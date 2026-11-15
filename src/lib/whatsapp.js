/**
 * SIIT — WhatsApp integration stub (Phase 5)
 * ─────────────────────────────────────────────────────────────
 * Uses WhatsApp Cloud API (Meta).
 *
 * TO GO LIVE:
 *   1. Create a Meta Developer app → WhatsApp product.
 *   2. Get a permanent token and your Phone Number ID.
 *   3. In .env:
 *        VITE_WHATSAPP_TOKEN="EAAxxxxx"
 *        VITE_WHATSAPP_PHONE_ID="1234567890"
 *   4. Uncomment the fetch() call in _send() below.
 *   NOTE: never call this from the browser with a real token —
 *   route it through a Supabase Edge Function or your backend.
 *
 * Usage (from admin or server-side):
 *   import { whatsapp } from "../lib/whatsapp";
 *   await whatsapp.send({ to: "917873987123", body: "Hello!" });
 *   await whatsapp.sendTemplate({ to, template: "admission_open", vars: ["July 1"] });
 */

const PHONE_ID = import.meta.env.VITE_WHATSAPP_PHONE_ID || "";
const TOKEN    = import.meta.env.VITE_WHATSAPP_TOKEN    || "";
const API_URL  = `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`;

async function _send(payload) {
  if (!PHONE_ID || !TOKEN) {
    console.warn("[WhatsApp stub] Credentials not set — message not sent:", payload);
    return { status: "stub", payload };
  }
  // UNCOMMENT when credentials are ready:
  // const res = await fetch(API_URL, {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  //   body: JSON.stringify(payload),
  // });
  // if (!res.ok) throw new Error(await res.text());
  // return res.json();
}

export const whatsapp = {
  /**
   * Send a plain text message.
   * @param {{ to: string, body: string }} opts
   *   to — phone in E.164 format without "+" (e.g. "917873987123")
   */
  async send({ to, body }) {
    return _send({ messaging_product: "whatsapp", to, type: "text", text: { body } });
  },

  /**
   * Send a pre-approved template message.
   * @param {{ to: string, template: string, vars: string[] }} opts
   *   template — name of the approved template in Meta dashboard
   *   vars     — positional parameters for {{1}}, {{2}}, etc.
   */
  async sendTemplate({ to, template, vars = [], language = "en" }) {
    return _send({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name:     template,
        language: { code: language },
        components: vars.length ? [{
          type:       "body",
          parameters: vars.map((v) => ({ type: "text", text: v })),
        }] : [],
      },
    });
  },

  /**
   * Convenience helpers used by admin panels.
   */
  async sendAdmissionUpdate(phone, studentName, courseName, startDate) {
    return this.send({ to: phone, body: `Dear ${studentName}, your admission to ${courseName} at SIIT is confirmed. Batch starts ${startDate}. Welcome! — SIIT Team` });
  },
  async sendResultNotification(phone, studentName, grade) {
    return this.send({ to: phone, body: `Dear ${studentName}, your SIIT result is now published. Overall Grade: ${grade}. Login to the student portal to view your report card.` });
  },
  async sendEventReminder(phone, eventTitle, date) {
    return this.send({ to: phone, body: `Reminder: "${eventTitle}" is happening on ${date} at SIIT Campus, Sorada. Don't miss it!` });
  },
  async sendAttendanceAlert(phone, studentName, rate) {
    return this.send({ to: phone, body: `Dear ${studentName}, your attendance this month is ${rate}%. Please maintain above 75% to be eligible for certification. — SIIT` });
  },
};
