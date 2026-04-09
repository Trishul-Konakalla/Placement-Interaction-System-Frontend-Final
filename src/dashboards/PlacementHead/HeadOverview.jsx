import { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import Layout from '../../components/common/Layout';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

export default function HeadOverview() {
  const { jobs, students } = useData();
  const [allApps, setAllApps] = useState([]);

  useEffect(() => {
    fetch('/api/applications/all')
      .then(r => r.json())
      .then(data => setAllApps(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Real stats from DB
  const placed = allApps.filter(a => a.status === 'Selected').length;
  const avgPkg = jobs.length > 0
    ? (jobs.reduce((sum, j) => sum + parseFloat(j.salaryPackage?.replace(/[^0-9.]/g, '') || 0), 0) / jobs.length).toFixed(1)
    : 0;

  const stats = [
    { label: 'Total Students', value: students.length, color: '#4F46E5' },
    { label: 'Placed Students', value: placed, color: '#10B981' },
    { label: 'Companies Visited', value: jobs.length, color: '#F59E0B' },
    { label: 'Avg Package (LPA)', value: avgPkg, color: '#8B5CF6' },
  ];

  // Top companies from real jobs table
  const topCompanies = jobs
    .map(j => ({ name: j.companyName, package: parseFloat(j.salaryPackage?.replace(/[^0-9.]/g, '') || 0) }))
    .sort((a, b) => b.package - a.package)
    .slice(0, 6);

  // Status breakdown from real applications
  const statusBreakdown = Object.values(
    allApps.reduce((acc, a) => {
      const s = a.status || 'Applied';
      acc[s] = acc[s] || { name: s, value: 0 };
      acc[s].value += 1;
      return acc;
    }, {})
  );

  // Applications per company (bar chart)
  const appsByCompany = Object.values(
    allApps.reduce((acc, a) => {
      const key = a.companyName || 'Unknown';
      acc[key] = acc[key] || { company: key, applications: 0 };
      acc[key].applications += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.applications - a.applications).slice(0, 6);

  // Monthly applications trend from real appliedOn dates
  const monthlyTrend = Object.values(
    allApps.reduce((acc, a) => {
      if (!a.appliedOn) return acc;
      const month = new Date(a.appliedOn).toLocaleString('default', { month: 'short' });
      acc[month] = acc[month] || { month, applications: 0 };
      acc[month].applications += 1;
      return acc;
    }, {})
  );

  return (
    <Layout>
      <div className="page-header">
        <div><h1>Placement Dashboard</h1><p>Live data from database</p></div>
      </div>

      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
        {stats.map(s => (
          <div key={s.label} className="card stat-card">
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Applications Over Time</h3>
          {monthlyTrend.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem 0' }}>No application data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="applications" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Application Status Breakdown</h3>
          {statusBreakdown.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem 0' }}>No applications yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusBreakdown} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Top Companies by Package (LPA)</h3>
          {topCompanies.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem 0' }}>No companies posted yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topCompanies} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="package" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Applications per Company</h3>
          {appsByCompany.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem 0' }}>No applications yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={appsByCompany} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="company" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="applications" fill="#4F46E5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Layout>
  );
}
