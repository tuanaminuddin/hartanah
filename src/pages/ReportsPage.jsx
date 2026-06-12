import { FileText, MapPin, TrendingUp } from 'lucide-react';
import { PageHeader, statuses } from '../components/shared.jsx';
export default function ReportsPage({ properties }) {
  const reportCards = [
    { label: 'Monthly Sales', value: 'RM 8.4M', note: '+18% from May', icon: TrendingUp },
    { label: 'Booked Pipeline', value: 'RM 12.1M', note: '38 pending properties', icon: FileText },
    { label: 'Top Region', value: 'Kuala Lumpur', note: '2 premium listings', icon: MapPin },
  ];

  return (
    <>
      <PageHeader title="Reports" description="Portfolio performance snapshots for management review." />
      <section className="grid gap-4 lg:grid-cols-3">
        {reportCards.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">{item.value}</h2>
                  <p className="mt-3 text-sm font-medium text-emerald-700">{item.note}</p>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Icon size={22} />
                </div>
              </div>
            </article>
          );
        })}
      </section>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-slate-950">Status Breakdown</h2>
        <div className="mt-5 space-y-4">
          {statuses.map((status) => {
            const count = properties.filter((property) => property.status === status).length;
            const percentage = properties.length ? Math.round((count / properties.length) * 100) : 0;
            return (
              <div key={status}>
                <div className="mb-2 flex justify-between text-sm font-semibold text-slate-700">
                  <span>{status}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

