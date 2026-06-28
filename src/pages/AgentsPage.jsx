import { useState } from 'react';
import { KeyRound, PlusCircle, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { PageHeader } from '../components/shared.jsx';

const emptyForm = { username: '', password: '', role: 'agent' };

export default function AgentsPage({ users, currentUserId, onSave, onDelete }) {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setIsSaving(true);

    try {
      await onSave(form);
      setForm(emptyForm);
      setMessage({ type: 'success', text: 'User account created successfully.' });
    } catch (requestError) {
      setMessage({ type: 'error', text: requestError.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete the account “${user.username}”? This cannot be undone.`)) return;

    setMessage(null);
    setDeletingUserId(user.id);
    try {
      await onDelete(user.id);
      setMessage({ type: 'success', text: `Account “${user.username}” deleted.` });
    } catch (requestError) {
      setMessage({ type: 'error', text: requestError.message });
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Add Agent"
        description="Create and control the accounts that can sign in to the portal."
      />

      <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Create Login Account</h2>
            <p className="text-sm text-slate-500">Add an agent or another administrator.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Username</span>
            <input
              value={form.username}
              onChange={(event) => updateField('username', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="agent.username"
              autoComplete="off"
              minLength={3}
              maxLength={50}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Account Type</span>
            <select
              value={form.role}
              onChange={(event) => updateField('role', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>

        {message && (
          <p className={`mt-4 rounded-lg px-3 py-2 text-sm font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            disabled={isSaving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70"
          >
            <PlusCircle size={17} />
            {isSaving ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">Portal Users</h2>
          <p className="mt-1 text-sm text-slate-500">Only administrators can view and manage these accounts.</p>
        </div>

        <div className="divide-y divide-slate-200">
          {users.map((user) => {
            const isCurrentUser = Number(user.id) === Number(currentUserId);
            const isDeleting = deletingUserId === user.id;

            return (
              <div key={user.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                    {user.role === 'admin' ? <ShieldCheck size={19} /> : <UserRound size={19} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-bold text-slate-950">{user.username}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                        user.role === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role}
                      </span>
                      {isCurrentUser && <span className="text-xs font-semibold text-slate-500">You</span>}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Created {new Date(user.createdAt).toLocaleDateString('en-MY')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isCurrentUser || isDeleting}
                  onClick={() => handleDelete(user)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  title={isCurrentUser ? 'You cannot delete your active account' : `Delete ${user.username}`}
                >
                  <Trash2 size={16} />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            );
          })}

          {!users.length && (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No user accounts found.</p>
          )}
        </div>
      </section>
    </>
  );
}
