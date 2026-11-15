import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList,
} from "recharts";
import { FaUsers, FaClock, FaMousePointer, FaMobileAlt } from "react-icons/fa";

import { analyticsService } from "../../services/growthDb";

/**
 * SIIT — Admin: Website Analytics (Phase 5)
 * Overview cards, visitor trend, device breakdown pie, traffic sources,
 * top pages table, conversion funnel. All from analyticsService.
 * TODO: replace dummy snapshot with GA4 Data API (see growthDb.js).
 */

const COLORS = ["#1c3fbd","#eb0249","#f18032","#1DA1F2","#8B46FF"];

const StatCard = ({ label, value, sub, Icon, color }) => (
  <div className="flex items-center justify-between rounded-2xl bg-white p-4">
    <div>
      <div className="text-2xl font-medium" style={{ color }}>{value}</div>
      <div className="text-sm font-medium">{label}</div>
      {sub && <div className="text-xs text-dark-grey">{sub}</div>}
    </div>
    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${color}14` }}>
      <Icon size={20} style={{ color }} />
    </div>
  </div>
);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => { analyticsService.getSnapshot().then(setData); }, []);

  if (!data) return <div className="py-20 text-center text-text_color2">Loading analytics…</div>;

  const { overview, visitorTrend, deviceBreakdown, trafficSources, topPages, conversionFunnel } = data;
  const fmtSec = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium">Website Analytics</h1>

      {/* overview cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Visitors"   value={overview.totalVisitors.toLocaleString()}  color="#1c3fbd" Icon={FaUsers}       />
        <StatCard label="Daily Visitors"   value={overview.dailyVisitors}                   color="#eb0249" Icon={FaUsers}       sub="today" />
        <StatCard label="Avg. Session"     value={fmtSec(overview.avgSessionSec)}           color="#f18032" Icon={FaClock}       />
        <StatCard label="Bounce Rate"      value={`${overview.bounceRate}%`}                color="#1DA1F2" Icon={FaMousePointer} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* visitor trend */}
        <div className="rounded-2xl bg-white p-5">
          <h2 className="mb-4 font-medium">Visitor Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={visitorTrend} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ff" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#f0f4ff" }} />
              <Bar dataKey="visitors" fill="#1c3fbd" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* device breakdown */}
        <div className="rounded-2xl bg-white p-5">
          <h2 className="mb-4 font-medium">Device Breakdown</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={deviceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, value }) => `${name} ${value}%`}>
                {deviceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* traffic sources */}
        <div className="rounded-2xl bg-white p-5">
          <h2 className="mb-4 font-medium">Traffic Sources</h2>
          {trafficSources.map((s, i) => (
            <div key={s.source} className="mb-3">
              <div className="mb-1 flex justify-between text-sm">
                <span>{s.source}</span><span className="font-medium">{s.pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-grey">
                <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: COLORS[i % COLORS.length] }} />
              </div>
            </div>
          ))}
        </div>

        {/* top pages */}
        <div className="rounded-2xl bg-white p-5">
          <h2 className="mb-4 font-medium">Top Pages</h2>
          {topPages.map((p, i) => (
            <div key={p.page} className="mb-2.5 flex items-center justify-between border-b border-grey pb-2.5 last:border-0">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: COLORS[i % COLORS.length] }}>
                  {i + 1}
                </span>
                <span className="text-sm font-medium">{p.label}</span>
              </div>
              <span className="text-sm text-dark-grey">{p.views.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* conversion funnel */}
        <div className="rounded-2xl bg-white p-5">
          <h2 className="mb-4 font-medium">Conversion Funnel</h2>
          {conversionFunnel.map((f, i) => {
            const pct = Math.round((f.count / conversionFunnel[0].count) * 100);
            return (
              <div key={f.stage} className="mb-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-text_color2">{f.stage}</span>
                  <span className="font-medium">{f.count.toLocaleString()} <span className="text-dark-grey">({pct}%)</span></span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-grey">
                  <div className="h-full rounded-full bg-buttons_1 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs text-dark-grey">
        Showing dummy data. Connect GA4: set <code>VITE_GA4_MEASUREMENT_ID</code> and uncomment the GA4 call in <code>src/services/growthDb.js</code>.
      </p>
    </div>
  );
};

export default AdminAnalytics;
