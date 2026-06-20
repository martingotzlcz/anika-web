import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Eye, Repeat, Smartphone, Monitor, Tablet } from 'lucide-react';

const PAGE_LABELS = {
  Home: 'Domů',
  About: 'O mně',
  Events: 'Termíny',
  Music: 'Hudba',
  Contact: 'Kontakt',
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-[#1e3a5f]">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPanel() {
  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['pageVisits'],
    queryFn: () => base44.entities.PageVisit.list('-created_date', 2000),
  });

  const stats = useMemo(() => {
    if (!visits.length) return null;

    const totalViews = visits.length;
    const uniqueVisitors = new Set(visits.map(v => v.visitor_id)).size;
    const uniqueSessions = new Set(visits.map(v => v.session_id)).size;

    // Returning visitors = visitor_ids that appear in more than 1 session
    const visitorSessions = {};
    visits.forEach(v => {
      if (!visitorSessions[v.visitor_id]) visitorSessions[v.visitor_id] = new Set();
      visitorSessions[v.visitor_id].add(v.session_id);
    });
    const returningVisitors = Object.values(visitorSessions).filter(s => s.size > 1).length;

    // Page counts
    const pageCounts = {};
    visits.forEach(v => {
      const label = PAGE_LABELS[v.page] || v.page;
      pageCounts[label] = (pageCounts[label] || 0) + 1;
    });
    const pageData = Object.entries(pageCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Device counts
    const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
    visits.forEach(v => {
      if (v.device_type) deviceCounts[v.device_type]++;
    });

    // Daily visits (last 14 days)
    const now = new Date();
    const dailyMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getDate()}.${d.getMonth() + 1}.`;
      dailyMap[key] = 0;
    }
    visits.forEach(v => {
      const d = new Date(v.created_date);
      const key = `${d.getDate()}.${d.getMonth() + 1}.`;
      if (dailyMap[key] !== undefined) dailyMap[key]++;
    });
    const dailyData = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    return { totalViews, uniqueVisitors, uniqueSessions, returningVisitors, pageData, deviceCounts, dailyData };
  }, [visits]);

  if (isLoading) return <div className="text-gray-400 text-sm py-8 text-center">Načítám data...</div>;
  if (!stats) return <div className="text-gray-400 text-sm py-8 text-center">Zatím žádná data. Data se začnou sbírat od teď.</div>;

  const COLORS = ['#1e3a5f', '#c94a4a', '#2a6496', '#e8704a', '#5a7fa6'];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Celkem zobrazení" value={stats.totalViews} color="bg-[#1e3a5f]" />
        <StatCard icon={Users} label="Unikátní návštěvníci" value={stats.uniqueVisitors} color="bg-[#c94a4a]" />
        <StatCard icon={Repeat} label="Vracející se" value={stats.returningVisitors} color="bg-emerald-500" />
        <StatCard icon={Eye} label="Sessions" value={stats.uniqueSessions} color="bg-amber-500" />
      </div>

      {/* Daily chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Zobrazení – posledních 14 dní</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stats.dailyData} barSize={18}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
            <Tooltip />
            <Bar dataKey="count" name="Zobrazení" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Nejnavštěvovanější stránky</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.pageData} layout="vertical" barSize={16}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
              <Tooltip />
              <Bar dataKey="count" name="Zobrazení" radius={[0, 4, 4, 0]}>
                {stats.pageData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Devices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Zařízení</h3>
          <div className="space-y-3 mt-6">
            {[
              { label: 'Desktop', key: 'desktop', icon: Monitor, color: 'bg-[#1e3a5f]' },
              { label: 'Mobil', key: 'mobile', icon: Smartphone, color: 'bg-[#c94a4a]' },
              { label: 'Tablet', key: 'tablet', icon: Tablet, color: 'bg-amber-500' },
            ].map(({ label, key, icon: Icon, color }) => {
              const count = stats.deviceCounts[key] || 0;
              const pct = stats.totalViews > 0 ? Math.round((count / stats.totalViews) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{label}</span>
                      <span className="text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}