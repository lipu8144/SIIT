import { useEffect, useState } from "react";
import { SITE } from "../config/site";
import { siteConfigService } from "../services/db";

/**
 * SIIT — useSiteConfig
 * ─────────────────────
 * Returns the live contact/social details. Precedence:
 *   1. Values saved in the DB (Admin > Site Settings > Contact Info)
 *   2. Env vars / static defaults from config/site.js
 *
 * This means the client can edit the footer & contact details from the
 * admin dashboard, and they update everywhere immediately — no redeploy.
 */
export function useSiteConfig() {
  const [cfg, setCfg] = useState(SITE);

  useEffect(() => {
    let alive = true;
    siteConfigService.map().then((db) => {
      if (!alive || !db) return;
      // Only override when the DB has a non-empty value
      const pick = (dbVal, fallback) => (dbVal !== undefined && dbVal !== "" ? dbVal : fallback);
      setCfg({
        ...SITE,
        phone:       pick(db.contact_phone,   SITE.phone),
        email:       pick(db.contact_email,   SITE.email),
        address:     pick(db.contact_address, SITE.address),
        whatsapp:    pick(db.whatsapp_number, SITE.whatsapp),
        mapEmbedUrl: pick(db.map_embed_url,   SITE.mapEmbedUrl),
        social: {
          facebook:  pick(db.social_facebook,  SITE.social.facebook),
          instagram: pick(db.social_instagram, SITE.social.instagram),
          youtube:   pick(db.social_youtube,   SITE.social.youtube),
          twitter:   pick(db.social_twitter,   SITE.social.twitter),
        },
        timings: {
          weekday:  pick(db.timing_weekday,  "9:00 AM – 7:00 PM"),
          saturday: pick(db.timing_saturday, "9:00 AM – 2:00 PM"),
          sunday:   pick(db.timing_sunday,   "Closed"),
        },
      });
    }).catch(() => {/* keep static fallback */});
    return () => { alive = false; };
  }, []);

  return cfg;
}

/** WhatsApp deep-link builder that works with a live config object */
export const buildWhatsappLink = (number, text = "Hi, I'd like to know more about your courses.") =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
