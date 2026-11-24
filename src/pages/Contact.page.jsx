import { useRef, useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaPhoneAlt, FaInstagram, FaFacebookF, FaYoutube, FaWhatsapp,
  FaRegClock, FaPaperPlane,
} from "react-icons/fa";
import { IoMail, IoLocationSharp } from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";

import Reveal from "../common/Reveal";
import { leadService } from "../services/growthDb";
import { useSiteConfig, buildWhatsappLink } from "../hooks/useSiteConfig";

/**
 * SIIT — Contact page (redesigned)
 * Same content & integrations (EmailJS + lead capture + real Google Map,
 * all contact details, timings, socials). Cleaner two-column layout with
 * consistent containers and aligned cards. Brand tokens only.
 */

const field =
  "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-buttons_2 focus:bg-white/15 focus:ring-2 focus:ring-buttons_2/40";

export const Contact = () => {
  const SITE = useSiteConfig();
  useEffect(() => { document.title = "SIIT | Contact"; }, []);

  const form = useRef();
  const [sending, setSending] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    setSending(true);

    // Save the enquiry as a lead (shows in Admin → Leads CRM). We wait for the result so the
    // visitor is never told "received" when it was not saved.
    const fd = new FormData(form.current);
    const leadSaved = await leadService.create({
      name: fd.get("user_name") || "",
      phone: fd.get("user_phone") || "",
      email: fd.get("user_email") || "",
      course_interest: "General enquiry",
      remarks: fd.get("message") || "",
      status: "new",
      source: "contact-form",
    }).then(() => true).catch((err) => { console.error("Enquiry not saved:", err); return false; });

    // EmailJS is optional — configured via env vars. If not set, the lead
    // is still captured in the database above, so nothing is lost.
    const svc = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const tpl = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const key = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!svc || !tpl || !key) {
      if (leadSaved) {
        toast.success("Thanks! We've received your enquiry and will be in touch.");
        form.current.reset();
      } else {
        toast.error("Sorry, we could not send your message just now. Please call or WhatsApp us.");
      }
      setSending(false);
      return;
    }

    emailjs
      .sendForm(svc, tpl, form.current, { publicKey: key })
      .then(
        () => {
          toast.success("Sent successfully 🚀");
          form.current.reset();
          setSending(false);
        },
        (error) => {
          console.log("FAILED...", error?.text);
          if (leadSaved) {
            toast.success("Thanks! We've received your enquiry and will be in touch.");
            form.current.reset();
          } else {
            toast.error("Something went wrong ⚠️ Please call or WhatsApp us.");
          }
          setSending(false);
        }
      );
  };

  const DETAILS = [
    { Icon: FaPhoneAlt, label: "Phone", value: SITE.phone },
    { Icon: IoMail, label: "Email", value: SITE.email },
    { Icon: IoLocationSharp, label: "Address", value: SITE.address },
    { Icon: FaInstagram, label: "Instagram", value: "@oscit_siit_surada" },
  ];

  return (
    <div>
      
      {/* ── Hero band ── */}
      <section className="relative overflow-hidden bg-overlay">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle,rgba(235,2,73,.5),transparent 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle,rgba(241,128,50,.45),transparent 70%)" }} />
        <div className="container-x relative py-20 text-center sm:py-24">
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-white sm:text-5xl"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-3 max-w-xl text-lg text-white/80"
          >
            Don&apos;t hesitate to connect with us
          </motion.p>
        </div>
      </section>

      {/* ── Main grid ── */}
      <section className="container-x py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* LEFT — details */}
          <Reveal>
            <h2 className="text-3xl font-extrabold text-text_color1">
              Get In <span className="text-buttons_1">Touch</span>
            </h2>
            <p className="mt-3 max-w-md text-text_color2">
              We&apos;re here to help and answer any question you might have. If you have any
              questions or concerns, feel free to reach out to us.
            </p>

            {/* detail cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {DETAILS.map((c) => (
                <div key={c.label}
                  className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-buttons_1/10 text-buttons_1">
                    <c.Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-text_color1">{c.label}</h3>
                    <p className="break-words text-sm text-text_color2">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={buildWhatsappLink(SITE.whatsapp)}
              target="_blank" rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white shadow-lg shadow-[#25D366]/25 transition hover:-translate-y-0.5 hover:bg-[#1eb858]"
            >
              <FaWhatsapp size={18} /> Chat on WhatsApp
            </a>

            {/* timings */}
            <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5">
              <div className="mb-3 flex items-center gap-2 font-bold text-text_color1">
                <FaRegClock className="text-overlay" /> Institute Timings
              </div>
              {[
                { day: "Mon – Fri", hours: SITE.timings?.weekday },
                { day: "Saturday", hours: SITE.timings?.saturday },
                { day: "Sunday", hours: SITE.timings?.sunday, closed: /closed/i.test(SITE.timings?.sunday || "") },
              ].map((t) => (
                <div key={t.day} className="flex justify-between border-t border-grey py-2 text-sm first:border-t-0">
                  <span className="text-text_color2">{t.day}</span>
                  <span className={`font-semibold ${t.closed ? "text-buttons_1" : "text-text_color1"}`}>
                    {t.hours}
                  </span>
                </div>
              ))}
            </div>

            {/* socials */}
            <div className="mt-6 flex items-center gap-3">
              <span className="font-bold text-text_color1">Social Media</span>
              {[
                { Icon: FaFacebookF, href: "https://www.facebook.com/p/SIIT-100063805190257/" },
                { Icon: FaXTwitter, href: "https://twitter.com/" },
                { Icon: FaYoutube, href: "https://www.youtube.com/@SIIT_Surada" },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white text-text_color2 shadow-sm transition hover:-translate-y-0.5 hover:bg-buttons_1 hover:text-white">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </Reveal>

          {/* RIGHT — form */}
          <Reveal index={1}
            className="relative self-start overflow-hidden rounded-3xl bg-overlay p-6 sm:p-8">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle,rgba(241,128,50,.4),transparent 70%)" }} />
            <h3 className="relative text-xl font-bold text-white">Send us a message</h3>
            <p className="relative mt-1 text-sm text-white/70">We&apos;ll get back to you shortly.</p>

            <form ref={form} onSubmit={sendEmail} className="relative mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-white/80">Email</label>
                  <input type="email" name="user_email" placeholder="example@gmail.com" className={field} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-white/80">Name</label>
                  <input type="text" name="user_name" placeholder="John Smith" className={field} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/80">Phone</label>
                <input type="tel" name="user_phone" placeholder="1234567899" className={field} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-white/80">Message</label>
                <textarea name="message" placeholder="Hi, say something..." className={`${field} h-36 resize-none pt-3`} />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-buttons_1 px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-buttons_1/90 disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send message"} <FaPaperPlane size={13} />
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* ── Map ── */}
      <section className="container-x pb-16 sm:pb-20">
        <Reveal className="text-center">
          <h2 className="text-2xl font-bold text-text_color1">Find Us on Google Maps</h2>
          <p className="mt-2 text-text_color2">Visit our campus on Main Road, Sorada.</p>
        </Reveal>
        <Reveal index={1} className="mt-6 overflow-hidden rounded-3xl border border-black/5 shadow-sm">
          <iframe
            title="SIIT location"
            src={SITE.mapEmbedUrl}
            width="100%"
            height="430"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </section>
    </div>
  );
};

export default Contact;
