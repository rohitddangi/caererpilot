import { useEffect, useState } from 'react';
import { Briefcase, Database, ShieldCheck, Users } from 'lucide-react';
import MetricCard from '../components/MetricCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { api } from '../services/api.jsx';

export default function Admin() {
  const [analytics, setAnalytics] = useState({ users: 0, resources: 0, jobs: 0, certificates: 0, events: [] });

  useEffect(() => {
    api.get('/platform/admin/analytics').then(({ data }) => setAnalytics(data)).catch(() => {});
  }, []);

  return (
    <div>
      <SectionHeader eyebrow="Admin" title="Platform Operations Dashboard" description="Manage users, resources, jobs, certificates, and analytics." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Users" value={analytics.users} hint="secure" />
        <MetricCard icon={Database} label="Resources" value={analytics.resources} hint="curated" />
        <MetricCard icon={Briefcase} label="Jobs" value={analytics.jobs} hint="active" />
        <MetricCard icon={ShieldCheck} label="Certificates" value={analytics.certificates} hint="verified" />
      </div>
      <div className="glass mt-6 rounded-3xl p-5">
        <h2 className="mb-4 text-xl font-black">Recent Admin Events</h2>
        {analytics.events.map((event) => <div className="border-b border-white/10 py-3 text-zinc-300 last:border-0" key={event}>{event}</div>)}
      </div>
    </div>
  );
}
