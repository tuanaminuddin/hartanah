import { PageHeader, PermissionNotice } from '../components/shared.jsx';
export default function SettingsPage({ isAdmin }) {
  return (
    <>
      <PageHeader title="Settings" description="Configure dashboard preferences and company profile details." />
      <PermissionNotice isAdmin={isAdmin} />
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-slate-950">Company Profile</h2>
          <div className="mt-4 space-y-4">
            {['Company Name', 'Office Location', 'Support Email'].map((label) => (
              <label key={label} className="block">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <input
                  disabled={!isAdmin}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  defaultValue={label === 'Company Name' ? 'Infinite Property Team | FLP Agency' : ''}
                  placeholder={label}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-slate-950">Dashboard Preferences</h2>
          <div className="mt-4 space-y-3">
            {['Email notifications', 'Weekly sales report', 'Agent activity alerts'].map((label) => (
              <label key={label} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <input
                  type="checkbox"
                  defaultChecked
                  disabled={!isAdmin}
                  className="h-5 w-5 accent-emerald-500 disabled:cursor-not-allowed"
                />
              </label>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <button
              disabled={!isAdmin}
              className="h-11 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              Save Settings
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

