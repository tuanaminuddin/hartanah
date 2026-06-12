import { useState } from 'react';
import { Building2, Mail, Phone, PlusCircle, Users } from 'lucide-react';
import { MalaysiaLocationInput, PageHeader, PermissionNotice } from '../components/shared.jsx';
export default function AgentsPage({ agents, isAdmin, onSave }) {
  const [form, setForm] = useState({
    name: '',
    region: '',
    phone: '',
    email: '',
  });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const agentRegions = agents.map((agent) => agent.region);
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSaving(true);
    try {
      await onSave(form);
      setForm({ name: '', region: '', phone: '', email: '' });
      setMessage('Agent saved successfully.');
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Agents" description="Monitor agent coverage, contacts, and active listings." />
      <PermissionNotice isAdmin={isAdmin} />

      <form onSubmit={handleSubmit} className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Insert Agent Information</h2>
            <p className="text-sm text-slate-500">Add a new agent contact to the agency directory.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Agent Name</span>
            <input
              disabled={!isAdmin}
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Agent name"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Region</span>
            <MalaysiaLocationInput
              id="add-agent-region"
              disabled={!isAdmin}
              value={form.region}
              onChange={(value) => updateField('region', value)}
              locations={agentRegions}
              placeholder="Search area e.g. Shah Alam"
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Phone Number</span>
            <input
              disabled={!isAdmin}
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="+60 12-345 6789"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Email Address</span>
            <input
              disabled={!isAdmin}
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="agent@example.com"
              required
            />
          </label>
        </div>

        {message && (
          <p className={`mt-4 rounded-lg px-3 py-2 text-sm font-semibold ${
            message.toLowerCase().includes('success')
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            disabled={!isAdmin || isSaving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            <PlusCircle size={17} />
            {isSaving ? 'Saving...' : 'Save Agent'}
          </button>
        </div>
      </form>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {agents.map((agent) => (
          <article key={agent.email} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <Users size={22} />
              </div>
              <div>
                <h2 className="font-bold text-slate-950">{agent.name}</h2>
                <p className="text-sm text-slate-500">{agent.region}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2"><Phone size={16} /> {agent.phone}</p>
              <p className="flex items-center gap-2"><Mail size={16} /> {agent.email}</p>
              <p className="flex items-center gap-2"><Building2 size={16} /> {agent.listings} active listings</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

