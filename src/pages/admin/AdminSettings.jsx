import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSave, FaGlobe, FaChartBar, FaTachometerAlt, FaAddressBook } from "react-icons/fa";
import { siteSettingsService, siteConfigService } from "../../services/db";
import Reveal from "../../common/Reveal";
import { errText } from "../../lib/errors";

/**
 * SIIT — Admin: Site Settings (manageable stats)
 * Edit public-facing counters (Hero, About) and dashboard metrics
 * (page visits, enquiries) from one place.
 */

const GROUP_META = {
  hero:      { title: "Homepage Hero Stats",      Icon: FaGlobe,          color: "#1c3fbd", desc: "Shown on the homepage hero section." },
  about:     { title: "About Page Counters",      Icon: FaChartBar,       color: "#eb0249", desc: "Animated counters on the About page." },
  dashboard: { title: "Dashboard Metrics",        Icon: FaTachometerAlt,  color: "#f18032", desc: "Internal metrics shown on the admin dashboard." },
};

const FIELD = "w-full rounded-lg border border-[#1c3fbd]/20 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1c3fbd] focus:ring-2 focus:ring-[#1c3fbd]/20";

const AdminSettings = () => {
  const [settings, setSettings] = useState([]);
  const [config, setConfig] = useState([]);
  const [saving, setSaving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([siteSettingsService.list(), siteConfigService.listForAdmin()]).then(([stats, cfg]) => {
      if (!alive) return;
      const problems = [];
      if (stats.status === "fulfilled") setSettings(stats.value);
      else { console.error(stats.reason); problems.push(`Could not load the counters. ${errText(stats.reason, "Error")} (needs migration 0004).`); }
      if (cfg.status === "fulfilled") setConfig(cfg.value);
      else { console.error(cfg.reason); problems.push(`Could not load the contact details. ${errText(cfg.reason, "Error")} (needs migration 0006).`); }
      setLoadErrors(problems);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const handleConfigChange = (key, value) => {
    setConfig((prev) => prev.map((c) => (c.key === key ? { ...c, value } : c)));
  };

  const configRows = () => config.map((c) => ({ key: c.key, value: c.value, label: c.label, kind: c.kind }));

  const handleSaveConfig = async () => {
    setSaving("config");
    try {
      await siteConfigService.saveAll(configRows());
      toast.success("Contact info updated — live on the site now");
    } catch (err) {
      console.error(err);
      toast.error(errText(err, "Failed to save contact info"));
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (id, field, val) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: field === "value" ? Number(val) || val : val } : s))
    );
  };

  const handleSave = async (item) => {
    setSaving(item.id);
    try {
      await siteSettingsService.update(item.id, {
        label: item.label,
        value: Number(item.value) || 0,
        suffix: item.suffix,
      });
      toast.success(`"${item.label}" updated`);
    } catch (err) {
      console.error(err);
      toast.error(errText(err));
    } finally {
      setSaving(null);
    }
  };

  // Saves the counters AND the contact details, so the top button really means "all"
  const handleSaveAll = async () => {
    setSaving("all");
    try {
      await Promise.all(settings.map((s) =>
        siteSettingsService.update(s.id, { label: s.label, value: Number(s.value) || 0, suffix: s.suffix })
      ));
      if (config.length) await siteConfigService.saveAll(configRows());
      toast.success("All settings saved");
    } catch (err) {
      console.error(err);
      toast.error(errText(err));
    } finally {
      setSaving(null);
    }
  };

  const groups = ["hero", "about", "dashboard"];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-medium">Site Settings</h1>
        <button onClick={handleSaveAll} disabled={saving === "all"}
          className="btn-dark inline-flex items-center gap-2 text-sm">
          <FaSave size={12} /> {saving === "all" ? "Saving…" : "Save All"}
        </button>
      </div>

      {loadErrors.length > 0 && (
        <div className="mb-6 rounded-xl border border-buttons_1/30 bg-buttons_1/5 p-4 text-sm text-buttons_1">
          <p className="mb-1 font-semibold">This page could not load everything:</p>
          <ul className="list-disc space-y-1 pl-5">
            {loadErrors.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      )}

      {/* ── Contact & Social (footer + contact page) ── */}
      <Reveal className="mb-6 overflow-hidden rounded-2xl bg-white">
        <div className="flex items-center justify-between border-b border-grey px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "#1c3fbd14" }}>
              <FaAddressBook size={16} style={{ color: "#1c3fbd" }} />
            </div>
            <div>
              <h2 className="font-medium">Contact & Social Details</h2>
              <p className="text-xs text-dark-grey">Shown in the footer and contact page. Blank social links are hidden.</p>
            </div>
          </div>
          <button onClick={handleSaveConfig} disabled={saving === "config"}
            className="btn-dark inline-flex items-center gap-2 text-sm">
            <FaSave size={12} /> {saving === "config" ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          {config.map((c) => (
            <div key={c.key}>
              <label className="mb-1 block text-xs font-semibold uppercase text-dark-grey">{c.label}</label>
              <input
                value={c.value || ""}
                onChange={(e) => handleConfigChange(c.key, e.target.value)}
                type={c.kind === "email" ? "email" : c.kind === "tel" ? "tel" : "text"}
                placeholder={c.kind === "url" ? "https://… (blank to hide)" : ""}
                className="w-full rounded-lg border border-[#1c3fbd]/20 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1c3fbd] focus:ring-2 focus:ring-[#1c3fbd]/20"
              />
            </div>
          ))}
        </div>
        <p className="px-5 pb-4 text-xs text-dark-grey">
          WhatsApp number format: country code + number, no + or spaces (e.g. 917873987123).
          Map embed URL: Google Maps → Share → Embed a map → copy the src link.
        </p>
      </Reveal>

      {groups.map((group) => {
        const meta = GROUP_META[group];
        const items = settings.filter((s) => s.group === group);
        if (!items.length) return null;

        return (
          <Reveal key={group} className="mb-6 overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center gap-3 border-b border-grey px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `${meta.color}14` }}>
                <meta.Icon size={16} style={{ color: meta.color }} />
              </div>
              <div>
                <h2 className="font-medium">{meta.title}</h2>
                <p className="text-xs text-dark-grey">{meta.desc}</p>
              </div>
            </div>

            <div className="divide-y divide-grey/50">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="flex-1 min-w-0">
                    <input value={item.label}
                      onChange={(e) => handleChange(item.id, "label", e.target.value)}
                      className={`${FIELD} font-medium`}
                      placeholder="Label" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input value={item.value} type="number"
                      onChange={(e) => handleChange(item.id, "value", e.target.value)}
                      className={`${FIELD} w-28 text-center font-bold`}
                      placeholder="Value" />
                    <input value={item.suffix}
                      onChange={(e) => handleChange(item.id, "suffix", e.target.value)}
                      className={`${FIELD} w-16 text-center`}
                      placeholder="+" />
                    <button onClick={() => handleSave(item)}
                      disabled={saving === item.id}
                      className="shrink-0 rounded-lg bg-[#1c3fbd]/10 p-2.5 text-[#1c3fbd] hover:bg-[#1c3fbd]/20 disabled:opacity-40"
                      aria-label="Save">
                      <FaSave size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        );
      })}

      {!loading && settings.length === 0 && loadErrors.length === 0 && (
        <p className="mb-6 rounded-xl bg-white p-5 text-center text-sm text-dark-grey">
          No counters found. Run the SQL migration <code>0004_site_settings.sql</code> to create them.
        </p>
      )}

      <p className="text-xs text-dark-grey">
        Changes here update the public website immediately within this session.
        With Supabase connected, they persist across sessions.
      </p>
    </div>
  );
};

export default AdminSettings;
