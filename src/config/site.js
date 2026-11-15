/**
 * SIIT — Site configuration
 * ──────────────────────────
 * Central place for client-specific contact details and social links.
 * Set these via env vars (VITE_*) in Vercel; fall back to sensible
 * placeholders in development. Changing these does NOT require touching
 * component code.
 */

const env = import.meta.env;

export const SITE = {
  name: "SIIT",
  fullName: "Smart Institute of Information Technology",

  // ── Contact ──
  phone:   env.VITE_CONTACT_PHONE   || "(+91) 7873987123",
  email:   env.VITE_CONTACT_EMAIL   || "siitsurada@gmail.com",
  address: env.VITE_CONTACT_ADDRESS || "Main Road, Sorada, Ganjam, Odisha",

  // WhatsApp number in international format WITHOUT + or spaces
  whatsapp: env.VITE_WHATSAPP_NUMBER || "917873987123",

  // Google Maps embed URL (from Google Maps → Share → Embed a map → copy src)
  mapEmbedUrl: env.VITE_MAP_EMBED_URL ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3754.8722939592844!2d84.43073917552695!3d19.76057968159013!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a22dbe182fed6f5%3A0xe75d12a0f7b85fc5!2sSmart%20Institute%20Of%20Information%20Technology%20(SIIT)!5e0!3m2!1sen!2sin!4v1709897549671!5m2!1sen!2sin",

  // ── Social links (leave blank to hide the icon) ──
  social: {
    facebook:  env.VITE_SOCIAL_FACEBOOK  || "",
    instagram: env.VITE_SOCIAL_INSTAGRAM || "https://instagram.com/oscit_siit_surada",
    youtube:   env.VITE_SOCIAL_YOUTUBE   || "",
    twitter:   env.VITE_SOCIAL_TWITTER   || "",
  },

  timings: {
    weekday:  "9:00 AM – 7:00 PM",
    saturday: "9:00 AM – 2:00 PM",
    sunday:   "Closed",
  },
};

export const whatsappLink = (text = "Hi, I'd like to know more about your courses.") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

export default SITE;
