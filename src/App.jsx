import { useEffect, useRef, useState } from 'react';
import { createAgent, createProperty, getAgents, getProperties, login, softDeleteProperty, updateProperty, updatePropertyKiv } from './api.js';
import {
  Building2,
  Calculator,
  Clock,
  CircleDollarSign,
  Eye,
  FileText,
  BriefcaseBusiness,
  Camera,
  Home,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  MapPinned,
  MapPin,
  Menu,
  Phone,
  Pencil,
  Play,
  PlusCircle,
  Search,
  Settings,
  SlidersHorizontal,
  ShieldCheck,
  TrendingUp,
  Trash2,
  Users,
  X,
  FileBarChart,
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'property-listing', label: 'Property Listing', icon: Building2 },
  { id: 'add-property', label: 'Add Property', icon: PlusCircle, adminOnly: true },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
  { id: 'monthly-installment', label: 'Monthly Installment', icon: Calculator },
  { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
];

const statusStyles = {
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Booked: 'bg-amber-50 text-amber-700 ring-amber-200',
  Sold: 'bg-red-50 text-red-700 ring-red-200',
};

const statuses = ['Available', 'Booked', 'Sold'];

const getFileType = (file, fallbackType = 'application/octet-stream') => {
  if (file.type) return file.type;
  if (file.name.toLowerCase().endsWith('.pdf')) return 'application/pdf';
  return fallbackType;
};

const malaysiaLocationOptions = [
  'Alam Impian',
  'Ampang',
  'Ara Damansara',
  'Bangsar',
  'Bangi',
  'Banting',
  'Batang Kali',
  'Batu Caves',
  'Batu Pahat',
  'Bayan Baru',
  'Bayan Lepas',
  'Bukit Jalil',
  'Bukit Bintang',
  'Bukit Mertajam',
  'Butterworth',
  'Cheras',
  'Cyberjaya',
  'Damansara',
  'Damansara Heights',
  'Desa ParkCity',
  'George Town',
  'Gombak',
  'Ipoh',
  'Iskandar Puteri',
  'Johor Bahru',
  'Kajang',
  'Kangar',
  'Kepong',
  'Klang',
  'Kota Bharu',
  'Kota Damansara',
  'Kota Kinabalu',
  'Kota Kemuning',
  'Kuala Lumpur',
  'Kuala Selangor',
  'Kuala Terengganu',
  'Kuantan',
  'Kuchai Lama',
  'Kuching',
  'Melaka',
  'Miri',
  'Mont Kiara',
  'Nilai',
  'Old Klang Road',
  'Pandan Indah',
  'Puchong',
  'Putrajaya',
  'Rawang',
  'Sandakan',
  'Segambut',
  'Selayang',
  'Semenyih',
  'Sentul',
  'Sepang',
  'Seremban',
  'Seri Kembangan',
  'Setapak',
  'Setia Alam',
  'Shah Alam',
  'Skudai',
  'Sri Hartamas',
  'Subang Jaya',
  'Sungai Buloh',
  'Taiping',
  'Taman Desa',
  'Taman Melawati',
  'Tropicana',
  'USJ',
  'Wangsa Maju',
  'Alor Setar',
  'Balakong',
  'Bandar Baru Bangi',
  'Bandar Botanic',
  'Bandar Bukit Raja',
  'Bandar Kinrara',
  'Bandar Menjalara',
  'Bandar Puteri Klang',
  'Bandar Puteri Puchong',
  'Bandar Saujana Putra',
  'Bandar Sri Damansara',
  'Bandar Sunway',
  'Bandar Tasik Selatan',
  'Brickfields',
  'Damansara Jaya',
  'Damansara Perdana',
  'Denai Alam',
  'Jelutong',
  'Keramat',
  'Kota Samarahan',
  'Masai',
  'Mutiara Damansara',
  'Pengerang',
  'Petaling Jaya',
  'Port Dickson',
  'Pulau Tikus',
  'Seberang Jaya',
  'Senai',
  'Serdang',
  'Setia EcoHill',
  'Tanjung Bungah',
  'Tebrau',
  'TTDI',
];

const getLocationOptions = (locations = []) => (
  [...new Set([...malaysiaLocationOptions, ...locations].filter(Boolean))].sort((first, second) => (
    first.localeCompare(second)
  ))
);

const publicUser = {
  name: 'Visitor',
  role: 'public',
  title: 'Public Access',
};

function AdminLoginDialog({ onClose, onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login(credentials);
      onLogin(result.user, result.token);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4">
      <button className="absolute inset-0 h-full w-full" onClick={onClose} aria-label="Close admin access" />
      <form onSubmit={handleSubmit} className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
          <div className="mb-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-full border border-emerald-300 bg-white">
                <img className="h-full w-full object-cover" src="/images/logo_infinite.jpeg" alt="Infinite team" />
              </div>
              <div>
                <p className="font-bold tracking-[0.14em] text-emerald-600">INFINITE</p>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">FLP Agency Partner</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-950">Admin Access</h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to manage properties and settings.</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Username</span>
              <input
                value={credentials.username}
                onChange={(event) => setCredentials({ ...credentials, username: event.target.value })}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="admin"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Password</span>
              <input
                type="password"
                value={credentials.password}
                onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="admin123"
              />
            </label>
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

          <button disabled={isLoading} className="mt-5 h-11 w-full rounded-lg bg-emerald-500 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-bold text-slate-950">Admin account</p>
            <p className="mt-2">Admin: admin / admin123</p>
          </div>
      </form>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status] || statusStyles.Available}`}
    >
      {status}
    </span>
  );
}

function TopNav({
  activePage,
  currentUser,
  isAdmin,
  isMenuOpen,
  onNavigate,
  onAdminAccess,
  onLogout,
  onMenuClick,
}) {
  const visibleMenuItems = menuItems.filter((item) => isAdmin || !item.adminOnly);

  return (
    <header className="glass-nav sticky top-0 z-30">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="glass-icon-button grid h-9 w-9 place-items-center rounded-full text-slate-900 transition lg:hidden"
            aria-label="Open navigation"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="glass-brand flex min-w-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-left transition"
            aria-label="Open dashboard"
          >
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/70 bg-white/60">
              <img className="h-full w-full object-cover" src="/images/logo_infinite.jpeg" alt="Infinite team" />
            </div>
            <span className="truncate text-sm font-semibold text-slate-950">Infinite</span>
          </button>
        </div>

        <nav className="simple-tab-bar hidden items-center justify-center gap-1 lg:flex">
          {visibleMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`simple-tab h-10 rounded-full px-5 text-sm font-semibold ${
                activePage === item.id
                  ? 'simple-tab-active'
                  : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1">
          <button
            onClick={isAdmin ? onLogout : onAdminAccess}
            className="glass-icon-button grid h-9 w-9 place-items-center rounded-full text-slate-900 transition"
            aria-label={isAdmin ? 'Exit admin access' : 'Open admin access'}
            title={isAdmin ? `Exit ${currentUser.name}` : 'Admin access'}
          >
            {isAdmin ? <LogOut size={18} /> : <LockKeyhole size={18} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="glass-menu absolute left-0 right-0 top-full px-4 py-3 lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`simple-tab flex h-11 items-center gap-3 rounded-full px-4 text-left text-sm font-semibold ${
                    activePage === item.id
                      ? 'simple-tab-active'
                      : ''
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const footerLinks = ['Privacy Policy', 'Terms of Service', 'Contact Us'];
  const socialLinks = [
    { label: 'Location', icon: MapPinned },
    { label: 'Instagram', icon: Camera },
    { label: 'LinkedIn', icon: BriefcaseBusiness },
    { label: 'YouTube', icon: Play },
  ];

  return (
    <footer className="site-footer mt-auto">
      <div className="mx-auto flex min-h-14 max-w-7xl flex-col items-center justify-between gap-4 px-4 py-3 sm:flex-row md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-amber-200 bg-white/70">
            <img className="h-full w-full object-cover" src="/images/logo_infinite.jpeg" alt="Infinite Properties logo" />
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <p className="truncate text-sm font-bold text-stone-950">Infinite Properties Sdn. Bhd.</p>
            <p className="text-xs font-medium text-stone-500">&copy; 2026 All rights reserved.</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-8">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-stone-600 sm:text-sm">
            {footerLinks.map((link, index) => (
              <a key={link} href="#" className="inline-flex items-center gap-5 transition hover:text-amber-700">
                <span>{link}</span>
                {index < footerLinks.length - 1 && <span className="hidden text-stone-400 sm:inline">&middot;</span>}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href="#"
                  className="footer-social"
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon size={16} strokeWidth={2.3} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

function PermissionNotice({ isAdmin }) {
  return (
    <div className={`mb-5 flex items-start gap-3 rounded-lg border px-4 py-3 ${
      isAdmin
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-amber-200 bg-amber-50 text-amber-800'
    }`}>
      <ShieldCheck size={20} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-bold">{isAdmin ? 'Admin access enabled' : 'Read-only access'}</p>
        <p className="mt-1 text-sm">
          {isAdmin
            ? 'You can create and update system information.'
            : 'Only admin users can change property or company information.'}
        </p>
      </div>
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{stat.value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
          <Icon size={22} />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-emerald-700">{stat.trend}</p>
    </div>
  );
}

function MalaysiaLocationInput({
  id,
  value,
  onChange,
  locations = malaysiaLocationOptions,
  placeholder = 'Search Malaysia area',
  disabled = false,
  required = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const options = getLocationOptions(locations);
  const searchTerm = value.trim().toLowerCase();
  const filteredOptions = options
    .filter((location) => location.toLowerCase().includes(searchTerm))
    .slice(0, 12);

  return (
    <div className="relative z-40">
      <input
        id={id}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        className={className}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
      />
      {isOpen && !disabled && (
        <div
          id={`${id}-options`}
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
          role="listbox"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((location) => (
              <button
                key={location}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(location);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                role="option"
                aria-selected={location === value}
              >
                <MapPin size={15} className="shrink-0 text-slate-400" />
                <span className="truncate">{location}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm font-medium text-slate-500">
              Keep typing to add this Malaysia area.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Filters({ filters, locations, onFilterChange, onClearFilters, resultCount }) {
  return (
    <section className="relative z-20 rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-950">Search and Filter</p>
        <p className="text-sm font-medium text-slate-500">{resultCount} properties found</p>
      </div>
      <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={filters.search}
            onChange={(event) => onFilterChange('search', event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            placeholder="Search Property"
          />
        </label>
        <MalaysiaLocationInput
          id="property-location-filter"
          value={filters.location}
          onChange={(value) => onFilterChange('location', value)}
          locations={locations}
          placeholder="Search Location"
          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        />
        <select
          value={filters.status}
          onChange={(event) => onFilterChange('status', event.target.value)}
          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Filter by Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          onClick={onClearFilters}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
        >
          <SlidersHorizontal size={17} />
          Reset
        </button>
      </div>
    </section>
  );
}

function RecentPropertiesTable({ properties, isAdmin = false, limit = 5, onDelete, onEdit, onKiv, onViewDetails }) {
  const [deletingId, setDeletingId] = useState(null);
  const visibleProperties = limit ? properties.slice(0, limit) : properties;

  const handleDelete = async (property) => {
    if (!window.confirm(`Delete "${property.name}" from active listings?`)) {
      return;
    }

    setDeletingId(property.id);
    try {
      await onDelete(property.id);
    } catch (requestError) {
      window.alert(requestError.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Recent Properties</h2>
          <p className="text-sm text-slate-500">Latest portfolio updates from active developers</p>
        </div>
        <button className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Property Name</th>
              <th className="px-5 py-3 font-bold">Location</th>
              <th className="px-5 py-3 font-bold">Price</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold">Developer</th>
              <th className="px-5 py-3 font-bold">Sales Package</th>
              <th className="px-5 py-3 font-bold">Updated Date</th>
              {onViewDetails && <th className="px-5 py-3 text-right font-bold">Details</th>}
              {isAdmin && <th className="px-5 py-3 text-right font-bold">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleProperties.map((property) => (
              <tr key={property.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-slate-950">{property.name}</td>
                <td className="px-5 py-4 text-slate-600">{property.location}</td>
                <td className="px-5 py-4 font-semibold text-slate-800">{property.price}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={property.status} />
                </td>
                <td className="px-5 py-4 text-slate-600">{property.agent}</td>
                <td className="px-5 py-4">
                  {property.salesPackages?.length ? (
                    <div className="flex max-w-56 flex-col gap-1">
                      {property.salesPackages.map((salesPackage) => (
                        <a
                          key={salesPackage.id}
                          className="truncate font-semibold text-emerald-700 hover:text-emerald-600"
                          href={salesPackage.url}
                          target="_blank"
                          rel="noreferrer"
                          title={salesPackage.name}
                        >
                          {salesPackage.name}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">Not uploaded</span>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-600">{property.updated}</td>
                {onViewDetails && (
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onViewDetails(property)}
                      className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                      <Eye size={14} />
                      Show
                    </button>
                  </td>
                )}
                {isAdmin && (
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(property)}
                          className="inline-grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                          aria-label={`Edit ${property.name}`}
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      {onKiv && (
                        <button
                          type="button"
                          onClick={() => onKiv(property)}
                          className={`inline-grid h-8 w-8 place-items-center rounded-md transition ${
                            property.isKiv
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                          aria-label={`${property.isKiv ? 'UnKIV' : 'KIV'} ${property.name}`}
                          title={property.isKiv ? 'UnKIV' : 'KIV'}
                        >
                          <Clock size={15} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          disabled={deletingId === property.id}
                          onClick={() => handleDelete(property)}
                          className="inline-grid h-8 w-8 place-items-center rounded-md text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Delete ${property.name}`}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {properties.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="font-bold text-slate-950">No matching properties</p>
            <p className="mt-1 text-sm text-slate-500">Try a different search term, location, or status.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function PropertyCard({ property, isAdmin = false, onEdit, onViewDetails }) {
  const images = property.projectImages?.length
    ? property.projectImages
    : property.image
      ? [{ id: 'legacy', name: property.name, url: property.image }]
      : [];
  const [activeImage, setActiveImage] = useState(0);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {images.length ? (
          <img className="h-full w-full object-cover" src={images[activeImage]?.url} alt={property.name} />
        ) : (
          <div className="grid h-full place-items-center text-sm font-semibold text-slate-400">No project image</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 p-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                activeImage === index ? 'border-emerald-500' : 'border-transparent'
              }`}
              aria-label={`Show project image ${index + 1}`}
            >
              <img className="h-full w-full object-cover" src={image.url} alt="" />
            </button>
          ))}
        </div>
      )}
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-950">{property.name}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{property.location}</p>
          </div>
          <StatusBadge status={property.status} />
        </div>
        <p className="text-xl font-bold text-slate-950">{property.price}</p>
        {(onViewDetails || (isAdmin && onEdit)) && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {onViewDetails && (
              <button
                type="button"
                onClick={() => onViewDetails(property)}
                className="h-10 rounded-lg bg-slate-950 text-sm font-bold text-white transition hover:bg-emerald-600"
              >
                View Details
              </button>
            )}
            {isAdmin && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(property)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                <Pencil size={15} />
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function PageHeader({ title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-5 py-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">Infinite Property Team | FLP Agency</p>
        <h1 className="mt-4 text-5xl font-semibold leading-none text-slate-950 md:text-7xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base font-medium text-slate-500 md:text-lg">{description}</p>
      </div>
      {action}
    </div>
  );
}

function DashboardPage({
  isAdmin,
  filters,
  filteredProperties,
  propertyRecords,
  onDelete,
  onEdit,
  onKiv,
  onFilterChange,
  onClearFilters,
  onNavigate,
}) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [kivProperty, setKivProperty] = useState(null);
  const locations = [...new Set(propertyRecords.map((property) => property.location))];
  const totalValue = propertyRecords
    .filter((property) => property.status === 'Sold')
    .reduce((sum, property) => sum + Number(String(property.price).replace(/[^\d.]/g, '')), 0);
  const liveStats = [
    { label: 'Total Properties', value: propertyRecords.length, trend: 'All portfolio records', icon: Building2 },
    { label: 'Available Properties', value: propertyRecords.filter((property) => property.status === 'Available').length, trend: 'Ready for enquiries', icon: Home },
    { label: 'Booked Properties', value: propertyRecords.filter((property) => property.status === 'Booked').length, trend: 'Pending deals', icon: SlidersHorizontal },
    { label: 'Sold Properties', value: propertyRecords.filter((property) => property.status === 'Sold').length, trend: `RM ${totalValue.toLocaleString('en-MY')} closed`, icon: CircleDollarSign },
  ];

  return (
    <>
      <PageHeader
        title="Property Hub"
        description="A simple place to browse listings, check availability, review agents, and estimate monthly payments."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {liveStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <div className="mt-6">
        <Filters
          filters={filters}
          locations={locations}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          resultCount={filteredProperties.length}
        />
      </div>

      <div className="mt-6">
        <RecentPropertiesTable
          properties={filteredProperties}
          isAdmin={isAdmin}
          onDelete={onDelete}
          onEdit={setEditingProperty}
          onKiv={setKivProperty}
        />
      </div>

      <section className="mt-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Featured Properties</h2>
            <p className="text-sm text-slate-500">Six active Malaysian listings ready for review</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => onNavigate('add-property')}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              <PlusCircle size={17} />
              Add Property
            </button>
          )}
        </div>
        <PropertyCardGrid
          properties={filteredProperties}
          isAdmin={isAdmin}
          onEdit={setEditingProperty}
          onViewDetails={setSelectedProperty}
        />
      </section>
      {selectedProperty && (
        <PropertyDetailsDialog property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
      {editingProperty && (
        <EditPropertyDialog
          property={editingProperty}
          locations={locations}
          onClose={() => setEditingProperty(null)}
          onSave={onEdit}
        />
      )}
      {kivProperty && (
        <KivPropertyDialog
          property={kivProperty}
          onClose={() => setKivProperty(null)}
          onSave={onKiv}
        />
      )}
    </>
  );
}

function PropertyCardGrid({ properties, isAdmin = false, onEdit, onViewDetails }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard
            key={property.id || property.name}
            property={property}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
      {properties.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
          <p className="font-bold text-slate-950">No property cards to display</p>
          <p className="mt-1 text-sm text-slate-500">Reset filters to show all sample listings.</p>
        </div>
      )}
    </>
  );
}

function KivPropertyDialog({ property, onClose, onSave }) {
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const nextIsKiv = !property.isKiv;
  const actionLabel = nextIsKiv ? 'KIV' : 'UnKIV';

  const handleSubmit = async () => {
    setMessage('');
    setIsSaving(true);
    try {
      await onSave(property.id, nextIsKiv);
      onClose();
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4">
      <button className="absolute inset-0 h-full w-full" type="button" onClick={onClose} aria-label="Close KIV property" />
      <section className="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Admin Action</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">{actionLabel} Property</h2>
            <p className="mt-1 text-sm text-slate-500">
              {nextIsKiv
                ? 'This listing will be hidden from users on every page.'
                : 'This listing will be visible to users again.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="font-bold text-slate-950">{property.name}</p>
          <p className="mt-1 text-sm font-medium text-slate-600">{property.location}</p>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Price</p>
              <p className="mt-1 font-bold text-slate-900">{property.price}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Developer</p>
              <p className="mt-1 font-bold text-slate-900">{property.agent}</p>
            </div>
          </div>
        </div>

        {message && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{message}</p>}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
          >
            {isSaving ? 'Saving...' : actionLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function EditPropertyDialog({ property, locations = [], onClose, onSave }) {
  let savedCalculator = defaultSalesCalculator;
  try {
    savedCalculator = normalizeSalesCalculator(property.salesPackageCalculator) || defaultSalesCalculator;
  } catch {
    savedCalculator = defaultSalesCalculator;
  }

  const [form, setForm] = useState({
    name: property.name || '',
    location: property.location || '',
    price: String(property.price || '').replace(/[^\d.]/g, ''),
    status: property.status || 'Available',
    developer: property.agent || '',
    image: property.image || '',
    notes: property.notes || '',
  });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [projectImages, setProjectImages] = useState([]);
  const [salesPackages, setSalesPackages] = useState([]);
  const [salesCalculator, setSalesCalculator] = useState(() => JSON.parse(JSON.stringify(savedCalculator)));
  const projectImagesInput = useRef(null);
  const salesPackageInput = useRef(null);
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const salesCalculatorResults = getSalesCalculatorResults(salesCalculator);
  const updateSalesCalculator = (field, value) => {
    setSalesCalculator((current) => ({ ...current, [field]: value }));
  };
  const updateSalesCalculatorColumn = (group, column, value) => {
    setSalesCalculator((current) => ({
      ...current,
      [group]: { ...current[group], [column]: value },
    }));
  };
  const updateRebateRowMeta = (rowId, field, value) => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: current.rebateRows.map((row) => (
        row.id === rowId ? { ...row, [field]: value } : row
      )),
    }));
  };
  const updateRebateRow = (rowId, field, value) => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: current.rebateRows.map((row) => (
        row.id === rowId
          ? { ...row, values: { ...row.values, [field]: value } }
          : row
      )),
    }));
  };
  const addRebateRow = () => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: [...current.rebateRows, createSalesCalculatorRow()],
    }));
  };
  const removeRebateRow = (rowId) => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: current.rebateRows.filter((row) => row.id !== rowId),
    }));
  };

  const readFiles = (files, fallbackType) => Promise.all(files.map((file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      name: file.name,
      type: getFileType(file, fallbackType),
      data: String(reader.result).split(',')[1],
    });
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
    reader.readAsDataURL(file);
  })));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSaving(true);
    try {
      if (salesPackages.length > 10) {
        throw new Error('Upload no more than 10 sales package files.');
      }

      if (salesPackages.some((salesPackage) => salesPackage.size > 20 * 1024 * 1024)) {
        throw new Error('Each sales package file must be 20 MB or smaller.');
      }

      if (salesPackages.reduce((total, salesPackage) => total + salesPackage.size, 0) > 50 * 1024 * 1024) {
        throw new Error('Sales package files must be 50 MB or smaller combined.');
      }

      if (projectImages.length > 10) {
        throw new Error('Upload no more than 10 project images.');
      }

      if (projectImages.some((image) => image.size > 5 * 1024 * 1024)) {
        throw new Error('Each project image must be 5 MB or smaller.');
      }

      if (projectImages.reduce((total, image) => total + image.size, 0) > 20 * 1024 * 1024) {
        throw new Error('Project images must be 20 MB or smaller combined.');
      }

      const projectImageData = await readFiles(projectImages, 'image/jpeg');
      const salesPackageData = await readFiles(salesPackages, 'application/octet-stream');
      const result = await onSave(property.id, {
        ...form,
        agent: form.developer,
        salesPackageCalculator: salesCalculator,
        ...(projectImages.length ? { projectImages: projectImageData, replaceProjectImages: true } : {}),
        ...(salesPackages.length ? { salesPackages: salesPackageData, replaceSalesPackages: true } : {}),
      });
      if (salesPackages.length && result?.replacedSalesPackages && result.salesPackageCount < salesPackages.length) {
        throw new Error('The property saved, but the sales package file was not stored. Please try again.');
      }
      onClose();
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 px-4 py-6">
      <button className="absolute inset-0 h-full w-full" type="button" onClick={onClose} aria-label="Close edit property" />
      <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-6xl rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Admin Edit</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Edit Property</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Project Name</span>
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Location</span>
            <MalaysiaLocationInput
              id={`edit-property-location-${property.id}`}
              value={form.location}
              onChange={(value) => updateField('location', value)}
              locations={locations}
              placeholder="Search area e.g. Klang, Cyberjaya"
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Starting Price</span>
            <input
              type="number"
              value={form.price}
              onChange={(event) => updateField('price', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Status</span>
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Developer</span>
            <input
              value={form.developer}
              onChange={(event) => updateField('developer', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              required
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Legacy Image URL</span>
            <input
              value={form.image}
              onChange={(event) => updateField('image', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="https://..."
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Project Images</span>
            {property.projectImages?.length ? (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {property.projectImages.map((image) => (
                  <a key={image.id} href={image.url} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50" title={image.name}>
                    <img className="aspect-square w-full object-cover" src={image.url} alt={image.name} />
                    <span className="block truncate px-2 py-1 text-xs text-slate-600">{image.name}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No uploaded project images yet.</p>
            )}
            <input
              ref={projectImagesInput}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setProjectImages(Array.from(event.target.files || []))}
              className="mt-3 block w-full rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-950 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-emerald-600"
            />
            <span className="mt-1 block text-xs text-slate-500">Choosing files replaces the uploaded project images. Upload up to 10 images, maximum 5 MB each and 20 MB combined.</span>
            {projectImages.length > 0 && <ProjectImagePreviews images={projectImages} />}
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Sales Package Files</span>
            {property.salesPackages?.length ? (
              <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {property.salesPackages.map((salesPackage) => (
                  <li key={salesPackage.id}>
                    <a
                      href={salesPackage.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:text-emerald-600"
                      title={salesPackage.name}
                    >
                      {salesPackage.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No sales package files yet.</p>
            )}
            <input
              ref={salesPackageInput}
              type="file"
              multiple
              onChange={(event) => setSalesPackages(Array.from(event.target.files || []))}
              className="mt-3 block w-full rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-950 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-emerald-600"
            />
            <span className="mt-1 block text-xs text-slate-500">Choosing files replaces the uploaded sales package files. Upload up to 10 files, maximum 20 MB each and 50 MB combined.</span>
            {salesPackages.length > 0 && (
              <ul className="mt-2 space-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                {salesPackages.map((salesPackage) => <li key={`${salesPackage.name}-${salesPackage.size}`}>{salesPackage.name}</li>)}
                <li className="text-emerald-700">Selected for save. Click Save Changes to upload.</li>
              </ul>
            )}
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              className="mt-2 min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Internal notes"
            />
          </label>
          <section className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50/50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
                  <CircleDollarSign size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-950">Sales Package Calculator</h2>
                  <p className="mt-1 text-sm text-slate-600">Update SPA price, rebates, and incentives for this project.</p>
                </div>
              </div>
              <label className="block sm:w-44">
                <span className="text-xs font-bold uppercase text-slate-500">Simulation</span>
                <input
                  value={salesCalculator.simulationName}
                  onChange={(event) => updateSalesCalculator('simulationName', event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-amber-200 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  placeholder="20x60"
                />
              </label>
            </div>

            <div className="mt-5 overflow-x-auto rounded-lg border border-amber-200 bg-white">
              <table className="min-w-[960px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-amber-200 text-center">
                    <th className="w-64 bg-white px-3 py-2 text-left text-xs font-bold uppercase text-slate-500">Lot Type</th>
                    <th colSpan="2" className="bg-emerald-100 px-3 py-2 font-bold text-emerald-950">Intermediate Lot</th>
                    <th colSpan="2" className="bg-sky-100 px-3 py-2 font-bold text-sky-950">End Lot</th>
                  </tr>
                  <tr className="border-b border-amber-200 text-center text-xs font-bold text-slate-600">
                    <th className="bg-white px-3 py-2 text-left">Buyer Type</th>
                    {salesPackageColumns.map((column) => (
                      <th key={column.id} className="px-3 py-2">{column.buyer}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="px-3 py-2 font-bold text-slate-700">SPA Price</td>
                    {salesPackageColumns.map((column) => (
                      <td key={column.id} className="px-2 py-2">
                        <input
                          type="number"
                          value={salesCalculator.spaPrices[column.id]}
                          onChange={(event) => updateSalesCalculatorColumn('spaPrices', column.id, event.target.value)}
                          className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-right text-xs font-semibold outline-none focus:border-emerald-400 focus:bg-white"
                        />
                      </td>
                    ))}
                  </tr>
                  {salesCalculator.rebateRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="px-3 py-2">
                        <div className="grid grid-cols-[1fr_4.5rem_2.25rem] items-center gap-2">
                          <input
                            value={row.label}
                            onChange={(event) => updateRebateRowMeta(row.id, 'label', event.target.value)}
                            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 focus:bg-white"
                            placeholder="Selection name"
                          />
                          <select
                            value={row.type}
                            onChange={(event) => updateRebateRowMeta(row.id, 'type', event.target.value)}
                            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 focus:bg-white"
                            aria-label={`${row.label || 'Selection'} type`}
                          >
                            <option value="percent">%</option>
                            <option value="amount">RM</option>
                          </select>
                          <button
                            disabled={salesCalculator.rebateRows.length === 1}
                            type="button"
                            onClick={() => removeRebateRow(row.id)}
                            className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Remove ${row.label || 'selection'}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                      {salesPackageColumns.map((column) => {
                        const rowValue = toAmount(row.values[column.id]);
                        const rowAmount = salesCalculatorResults[column.id].rebates[row.id];
                        return (
                          <td key={column.id} className="px-2 py-2">
                            <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                value={row.values[column.id]}
                                onChange={(event) => updateRebateRow(row.id, column.id, event.target.value)}
                                className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-right text-xs font-semibold outline-none focus:border-emerald-400 focus:bg-white"
                              />
                              <span className="text-right text-xs font-semibold text-slate-700">
                                {rowValue ? formatMoney(rowAmount) : '-'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="px-3 py-2 font-bold text-slate-950">Total Rebates</td>
                    {salesPackageColumns.map((column) => (
                      <td key={column.id} className="px-3 py-2 text-right font-bold text-slate-950">
                        {formatMoney(salesCalculatorResults[column.id].totalRebates)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50">
                    <td className="px-3 py-3 font-bold text-emerald-950">Net to Buyer Price</td>
                    {salesPackageColumns.map((column) => (
                      <td key={column.id} className="px-3 py-3 text-right font-bold text-emerald-950">
                        {formatMoney(salesCalculatorResults[column.id].netBuyerPrice)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-start">
              <button
                type="button"
                onClick={addRebateRow}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                <PlusCircle size={16} />
                Add Selection
              </button>
            </div>
          </section>
        </div>

        {message && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{message}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300"
          >
            Cancel
          </button>
          <button
            disabled={isSaving}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-500 px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PropertyListingPage({ isAdmin, filters, filteredProperties, propertyRecords, onDelete, onEdit, onKiv, onFilterChange, onClearFilters }) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [kivProperty, setKivProperty] = useState(null);
  const locations = [...new Set(propertyRecords.map((property) => property.location))];
  return (
    <>
      <PageHeader
        title="Property Listing"
        description="Review and filter all active Malaysian property records."
      />
      <Filters
        filters={filters}
        locations={locations}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        resultCount={filteredProperties.length}
      />
      <div className="mt-6">
        <RecentPropertiesTable
          properties={filteredProperties}
          isAdmin={isAdmin}
          limit={0}
          onDelete={onDelete}
          onEdit={setEditingProperty}
          onKiv={setKivProperty}
          onViewDetails={setSelectedProperty}
        />
      </div>
      <section className="mt-6">
        <PropertyCardGrid
          properties={filteredProperties}
          isAdmin={isAdmin}
          onEdit={setEditingProperty}
          onViewDetails={setSelectedProperty}
        />
      </section>
      {selectedProperty && (
        <PropertyDetailsDialog property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
      {editingProperty && (
        <EditPropertyDialog
          property={editingProperty}
          locations={locations}
          onClose={() => setEditingProperty(null)}
          onSave={onEdit}
        />
      )}
      {kivProperty && (
        <KivPropertyDialog
          property={kivProperty}
          onClose={() => setKivProperty(null)}
          onSave={onKiv}
        />
      )}
    </>
  );
}

function ProjectImagePreviews({ images }) {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const nextPreviews = images.map((image) => ({
      name: image.name,
      url: URL.createObjectURL(image),
    }));
    setPreviews(nextPreviews);

    return () => nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [images]);

  return (
    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
      {previews.map((preview) => (
        <div key={preview.url} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <img className="aspect-square w-full object-cover" src={preview.url} alt={preview.name} />
          <p className="truncate px-2 py-1 text-xs text-slate-600">{preview.name}</p>
        </div>
      ))}
    </div>
  );
}

const salesPackageColumns = [
  { id: 'intermediateBumi', lot: 'Intermediate Lot', buyer: 'Bumi' },
  { id: 'intermediateNonBumi', lot: 'Intermediate Lot', buyer: 'Non-Bumi' },
  { id: 'endBumi', lot: 'End Lot', buyer: 'Bumi' },
  { id: 'endNonBumi', lot: 'End Lot', buyer: 'Non-Bumi' },
];

const defaultSalesCalculator = {
  simulationName: '20x60',
  spaPrices: {
    intermediateBumi: '682800',
    intermediateNonBumi: '682800',
    endBumi: '791800',
    endNonBumi: '791800',
  },
  rebateRows: [
    {
      id: 'bumiRebate',
      label: 'Bumi Rebate',
      type: 'percent',
      values: { intermediateBumi: '7', intermediateNonBumi: '', endBumi: '7', endNonBumi: '' },
    },
    {
      id: 'rebate',
      label: 'Rebate',
      type: 'percent',
      values: { intermediateBumi: '13', intermediateNonBumi: '13', endBumi: '12', endNonBumi: '12' },
    },
    {
      id: 'conditionalRebate',
      label: 'Conditional Rebate',
      type: 'percent',
      values: { intermediateBumi: '3', intermediateNonBumi: '3', endBumi: '1', endNonBumi: '1' },
    },
    {
      id: 'conversionIncentive',
      label: 'Conversion Incentive',
      type: 'amount',
      values: { intermediateBumi: '', intermediateNonBumi: '', endBumi: '5000', endNonBumi: '5000' },
    },
  ],
};

const createSalesCalculatorRow = () => ({
  id: `custom-${Date.now()}`,
  label: '',
  type: 'percent',
  values: salesPackageColumns.reduce((values, column) => ({ ...values, [column.id]: '' }), {}),
});

const toAmount = (value) => {
  const amount = Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(amount) ? amount : 0;
};

const formatMoney = (value, decimals = 2) => (
  value.toLocaleString('en-MY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
);

const getSalesCalculatorResults = (calculator) => (
  salesPackageColumns.reduce((results, column) => {
    const spaPrice = toAmount(calculator.spaPrices[column.id]);
    let remainingPrice = spaPrice;
    let totalRebates = 0;

    const rebates = calculator.rebateRows.reduce((rowResults, row) => {
      const rowValue = toAmount(row.values[column.id]);
      const rebateAmount = row.type === 'percent' ? remainingPrice * (rowValue / 100) : rowValue;
      remainingPrice -= rebateAmount;
      totalRebates += rebateAmount;
      return { ...rowResults, [row.id]: rebateAmount };
    }, {});

    return {
      ...results,
      [column.id]: {
        spaPrice,
        rebates,
        totalRebates,
        netBuyerPrice: spaPrice - totalRebates,
      },
    };
  }, {})
);

const normalizeSalesCalculator = (calculator) => {
  if (!calculator) return null;

  const parsedCalculator = typeof calculator === 'string' ? JSON.parse(calculator) : calculator;
  if (!parsedCalculator?.spaPrices || !Array.isArray(parsedCalculator.rebateRows)) {
    return null;
  }

  return parsedCalculator;
};

function SalesPackageCalculatorSummary({ calculator }) {
  let salesCalculator = null;

  try {
    salesCalculator = normalizeSalesCalculator(calculator);
  } catch {
    salesCalculator = null;
  }

  if (!salesCalculator) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
        <p className="text-sm font-bold text-slate-700">No sales package calculator saved</p>
      </div>
    );
  }

  const results = getSalesCalculatorResults(salesCalculator);

  return (
    <div className="overflow-x-auto rounded-lg border border-amber-200 bg-white">
      <table className="min-w-[900px] w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-amber-200 text-center">
            <th className="w-56 bg-white px-3 py-2 text-left text-xs font-bold uppercase text-slate-500">
              {salesCalculator.simulationName || 'Simulation'}
            </th>
            <th colSpan="2" className="bg-emerald-100 px-3 py-2 font-bold text-emerald-950">Intermediate Lot</th>
            <th colSpan="2" className="bg-sky-100 px-3 py-2 font-bold text-sky-950">End Lot</th>
          </tr>
          <tr className="border-b border-amber-200 text-center text-xs font-bold text-slate-600">
            <th className="bg-white px-3 py-2 text-left">Buyer Type</th>
            {salesPackageColumns.map((column) => (
              <th key={column.id} className="px-3 py-2">{column.buyer}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="px-3 py-2 font-bold text-slate-700">SPA Price</td>
            {salesPackageColumns.map((column) => (
              <td key={column.id} className="px-3 py-2 text-right font-bold text-slate-800">
                {formatMoney(results[column.id].spaPrice)}
              </td>
            ))}
          </tr>
          {salesCalculator.rebateRows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100">
              <td className="px-3 py-2 font-bold text-slate-700">
                {row.label || 'Selection'}
                <span className="ml-2 text-xs font-semibold text-slate-400">{row.type === 'percent' ? '%' : 'RM'}</span>
              </td>
              {salesPackageColumns.map((column) => {
                const rowValue = toAmount(row.values?.[column.id]);
                return (
                  <td key={column.id} className="px-3 py-2 text-right text-slate-700">
                    {rowValue ? formatMoney(results[column.id].rebates[row.id]) : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="border-b border-slate-200 bg-slate-50">
            <td className="px-3 py-2 font-bold text-slate-950">Total Rebates</td>
            {salesPackageColumns.map((column) => (
              <td key={column.id} className="px-3 py-2 text-right font-bold text-slate-950">
                {formatMoney(results[column.id].totalRebates)}
              </td>
            ))}
          </tr>
          <tr className="bg-emerald-50">
            <td className="px-3 py-3 font-bold text-emerald-950">Net to Buyer Price</td>
            {salesPackageColumns.map((column) => (
              <td key={column.id} className="px-3 py-3 text-right font-bold text-emerald-950">
                {formatMoney(results[column.id].netBuyerPrice)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PropertyDetailsDialog({ property, onClose }) {
  const images = property.projectImages?.length
    ? property.projectImages
    : property.image
      ? [{ id: 'legacy', name: property.name, url: property.image }]
      : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 px-4 py-6">
      <button className="fixed inset-0 h-full w-full" type="button" onClick={onClose} aria-label="Close property details" />
      <section className="relative mx-auto max-w-6xl rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Property Details</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">{property.name}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{property.location}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <section>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              {images.length ? (
                <img className="aspect-[16/7] w-full object-cover" src={images[0].url} alt={property.name} />
              ) : (
                <div className="grid aspect-[16/7] min-h-64 place-items-center text-sm font-semibold text-slate-400">No project image</div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-4 text-lg font-bold text-slate-950">Project Information</h3>
            <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Price</p>
                <p className="mt-1 font-bold text-slate-950">{property.price}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Developer</p>
                <p className="mt-1 font-semibold text-slate-700">{property.agent}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Status</p>
                <div className="mt-1"><StatusBadge status={property.status} /></div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Updated</p>
                <p className="mt-1 font-semibold text-slate-700">{property.updated}</p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <p className="text-sm font-bold text-slate-950">Sales Package Files</p>
              {property.salesPackages?.length ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {property.salesPackages.map((salesPackage) => (
                    <a
                      key={salesPackage.id}
                      href={salesPackage.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:text-emerald-600"
                      title={salesPackage.name}
                    >
                      {salesPackage.name}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No file uploaded.</p>
              )}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <CircleDollarSign size={20} className="text-amber-700" />
              <h3 className="text-lg font-bold text-slate-950">Sales Package Calculator</h3>
            </div>
            <SalesPackageCalculatorSummary calculator={property.salesPackageCalculator} />
          </section>
        </div>
      </section>
    </div>
  );
}

function AddPropertyPage({ isAdmin, onSave, propertyRecords = [] }) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    price: '',
    status: 'Available',
    developer: '',
  });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [salesPackages, setSalesPackages] = useState([]);
  const [projectImages, setProjectImages] = useState([]);
  const [salesCalculator, setSalesCalculator] = useState(defaultSalesCalculator);
  const salesPackageInput = useRef(null);
  const projectImagesInput = useRef(null);
  const locations = propertyRecords.map((property) => property.location);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const salesCalculatorResults = getSalesCalculatorResults(salesCalculator);
  const updateSalesCalculator = (field, value) => {
    setSalesCalculator((current) => ({ ...current, [field]: value }));
  };
  const updateSalesCalculatorColumn = (group, column, value) => {
    setSalesCalculator((current) => ({
      ...current,
      [group]: { ...current[group], [column]: value },
    }));
  };
  const updateRebateRowMeta = (rowId, field, value) => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: current.rebateRows.map((row) => (
        row.id === rowId ? { ...row, [field]: value } : row
      )),
    }));
  };
  const updateRebateRow = (rowId, field, value) => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: current.rebateRows.map((row) => (
        row.id === rowId
          ? { ...row, values: { ...row.values, [field]: value } }
          : row
      )),
    }));
  };
  const addRebateRow = () => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: [...current.rebateRows, createSalesCalculatorRow()],
    }));
  };
  const removeRebateRow = (rowId) => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: current.rebateRows.filter((row) => row.id !== rowId),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSaving(true);
    try {
      if (salesPackages.length > 10) {
        throw new Error('Upload no more than 10 sales package files.');
      }

      if (salesPackages.some((salesPackage) => salesPackage.size > 20 * 1024 * 1024)) {
        throw new Error('Each sales package file must be 20 MB or smaller.');
      }

      if (salesPackages.reduce((total, salesPackage) => total + salesPackage.size, 0) > 50 * 1024 * 1024) {
        throw new Error('Sales package files must be 50 MB or smaller combined.');
      }

      const salesPackageData = await Promise.all(salesPackages.map((salesPackage) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: salesPackage.name,
          type: getFileType(salesPackage),
          data: String(reader.result).split(',')[1],
        });
        reader.onerror = () => reject(new Error(`Unable to read ${salesPackage.name}.`));
        reader.readAsDataURL(salesPackage);
      })));

      if (projectImages.length > 10) {
        throw new Error('Upload no more than 10 project images.');
      }

      if (projectImages.some((image) => image.size > 5 * 1024 * 1024)) {
        throw new Error('Each project image must be 5 MB or smaller.');
      }

      if (projectImages.reduce((total, image) => total + image.size, 0) > 20 * 1024 * 1024) {
        throw new Error('Project images must be 20 MB or smaller combined.');
      }

      const projectImageData = await Promise.all(projectImages.map((image) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: image.name,
          type: image.type,
          data: String(reader.result).split(',')[1],
        });
        reader.onerror = () => reject(new Error(`Unable to read ${image.name}.`));
        reader.readAsDataURL(image);
      })));

      await onSave({
        ...form,
        agent: form.developer,
        projectImages: projectImageData,
        salesPackages: salesPackageData,
        salesPackageCalculator: salesCalculator,
      });
      setForm({ name: '', location: '', price: '', status: 'Available', developer: '' });
      setSalesPackages([]);
      setProjectImages([]);
      if (salesPackageInput.current) salesPackageInput.current.value = '';
      if (projectImagesInput.current) projectImagesInput.current.value = '';
      setMessage('Property saved successfully.');
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Add Property"
        description="Capture a new listing before it moves into review and publication."
      />
      <PermissionNotice isAdmin={isAdmin} />
      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Project Name</span>
            <input
              disabled={!isAdmin}
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Project Name"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Location</span>
            <MalaysiaLocationInput
              id="add-property-location"
              disabled={!isAdmin}
              value={form.location}
              onChange={(value) => updateField('location', value)}
              locations={locations}
              placeholder="Search area e.g. Klang, Cyberjaya"
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Starting Price</span>
            <input
              disabled={!isAdmin}
              type="number"
              value={form.price}
              onChange={(event) => updateField('price', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Starting Price"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Status</span>
            <select
              disabled={!isAdmin}
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Developer</span>
            <input
              disabled={!isAdmin}
              value={form.developer}
              onChange={(event) => updateField('developer', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Developer"
              required
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Project Images</span>
            <input
              ref={projectImagesInput}
              disabled={!isAdmin}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setProjectImages(Array.from(event.target.files || []))}
              className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-950 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-emerald-600 disabled:cursor-not-allowed"
            />
            <span className="mt-1 block text-xs text-slate-500">Upload up to 10 images, maximum 5 MB each and 20 MB combined.</span>
            {projectImages.length > 0 && <ProjectImagePreviews images={projectImages} />}
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Sales Package</span>
            <input
              ref={salesPackageInput}
              disabled={!isAdmin}
              type="file"
              multiple
              onChange={(event) => setSalesPackages(Array.from(event.target.files || []))}
              className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-950 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-emerald-600 disabled:cursor-not-allowed"
            />
            <span className="mt-1 block text-xs text-slate-500">Upload up to 10 files, maximum 20 MB each and 50 MB combined.</span>
            {salesPackages.length > 0 && (
              <ul className="mt-2 space-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                {salesPackages.map((salesPackage) => <li key={`${salesPackage.name}-${salesPackage.size}`}>{salesPackage.name}</li>)}
                <li className="text-emerald-700">Selected for save. Click Save Property to upload.</li>
              </ul>
            )}
          </label>
          <section className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50/50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
                  <CircleDollarSign size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-950">Sales Package Calculator</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Build the package from SPA price and your own rebate or incentive selections.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:w-44">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-slate-500">Simulation</span>
                  <input
                    disabled={!isAdmin}
                    value={salesCalculator.simulationName}
                    onChange={(event) => updateSalesCalculator('simulationName', event.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border border-amber-200 bg-white px-3 text-sm font-semibold outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="20x60"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-lg border border-amber-200 bg-white">
              <table className="min-w-[960px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-amber-200 text-center">
                    <th className="w-64 bg-white px-3 py-2 text-left text-xs font-bold uppercase text-slate-500">Lot Type</th>
                    <th colSpan="2" className="bg-emerald-100 px-3 py-2 font-bold text-emerald-950">Intermediate Lot</th>
                    <th colSpan="2" className="bg-sky-100 px-3 py-2 font-bold text-sky-950">End Lot</th>
                  </tr>
                  <tr className="border-b border-amber-200 text-center text-xs font-bold text-slate-600">
                    <th className="bg-white px-3 py-2 text-left">Buyer Type</th>
                    {salesPackageColumns.map((column) => (
                      <th key={column.id} className="px-3 py-2">{column.buyer}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="px-3 py-2 font-bold text-slate-700">SPA Price</td>
                    {salesPackageColumns.map((column) => (
                      <td key={column.id} className="px-2 py-2">
                        <input
                          disabled={!isAdmin}
                          type="number"
                          value={salesCalculator.spaPrices[column.id]}
                          onChange={(event) => updateSalesCalculatorColumn('spaPrices', column.id, event.target.value)}
                          className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-right text-xs font-semibold outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white"
                        />
                      </td>
                    ))}
                  </tr>
                  {salesCalculator.rebateRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="px-3 py-2">
                        <div className="grid grid-cols-[1fr_4.5rem_2.25rem] items-center gap-2">
                          <input
                            disabled={!isAdmin}
                            value={row.label}
                            onChange={(event) => updateRebateRowMeta(row.id, 'label', event.target.value)}
                            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white"
                            placeholder="Selection name"
                          />
                          <select
                            disabled={!isAdmin}
                            value={row.type}
                            onChange={(event) => updateRebateRowMeta(row.id, 'type', event.target.value)}
                            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white"
                            aria-label={`${row.label || 'Selection'} type`}
                          >
                            <option value="percent">%</option>
                            <option value="amount">RM</option>
                          </select>
                          <button
                            disabled={!isAdmin || salesCalculator.rebateRows.length === 1}
                            type="button"
                            onClick={() => removeRebateRow(row.id)}
                            className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Remove ${row.label || 'selection'}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                      {salesPackageColumns.map((column) => {
                        const rowValue = toAmount(row.values[column.id]);
                        const rowAmount = salesCalculatorResults[column.id].rebates[row.id];
                        return (
                          <td key={column.id} className="px-2 py-2">
                            <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
                              <input
                                disabled={!isAdmin}
                                type="number"
                                step="0.01"
                                value={row.values[column.id]}
                                onChange={(event) => updateRebateRow(row.id, column.id, event.target.value)}
                                className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-right text-xs font-semibold outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white"
                              />
                              <span className="text-right text-xs font-semibold text-slate-700">
                                {rowValue ? formatMoney(rowAmount) : '-'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="px-3 py-2 font-bold text-slate-950">Total Rebates</td>
                    {salesPackageColumns.map((column) => (
                      <td key={column.id} className="px-3 py-2 text-right font-bold text-slate-950">
                        {formatMoney(salesCalculatorResults[column.id].totalRebates)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50">
                    <td className="px-3 py-3 font-bold text-emerald-950">Net to Buyer Price</td>
                    {salesPackageColumns.map((column) => (
                      <td key={column.id} className="px-3 py-3 text-right font-bold text-emerald-950">
                        {formatMoney(salesCalculatorResults[column.id].netBuyerPrice)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-start">
              <button
                disabled={!isAdmin}
                type="button"
                onClick={addRebateRow}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <PlusCircle size={16} />
                Add Selection
              </button>
            </div>
          </section>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className={`text-sm font-semibold ${message.includes('successfully') ? 'text-emerald-700' : 'text-red-700'}`}>{message}</p>
          <button
            disabled={!isAdmin || isSaving}
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            <PlusCircle size={17} />
            {isSaving ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </form>
    </>
  );
}

function AgentsPage({ agents, isAdmin, onSave }) {
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

function ReportsPage({ properties }) {
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

function SettingsPage({ isAdmin }) {
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

const monthlyInstallmentPackages = [
  {
    id: 'typeD',
    type: 'Type D',
    unit: 'T7-12-03',
    rooms: '3R 2B',
    carPark: 2,
    size: 958,
    spaPrice: 520800,
    discountPercent: 10,
    nett1: 468720,
    nett2Deduction: 15000,
    nett2: 453720,
    nett3Deduction: 6000,
    nett3: 447720,
  },
  {
    id: 'typeF',
    type: 'Type F',
    unit: 'T7-09-02',
    rooms: '3+1R 2B',
    carPark: 2,
    size: 1324,
    spaPrice: 654800,
    discountPercent: 10,
    nett1: 589320,
    nett2Deduction: 30000,
    nett2: 559320,
    nett3Deduction: 6000,
    nett3: 553320,
  },
];

const installmentScenarios = [
  { id: 'nett1', label: 'Nett (1)', field: 'nett1' },
  { id: 'nett2', label: 'Nett (2)', field: 'nett2' },
  { id: 'nett3', label: 'Nett (3)', field: 'nett3' },
];

const getMonthlyInstallment = (loanAmount, annualInterestRate, tenureYears) => {
  const principal = toAmount(loanAmount);
  const monthlyInterestRate = toAmount(annualInterestRate) / 100 / 12;
  const paymentCount = toAmount(tenureYears) * 12;

  if (!principal || !paymentCount) return 0;
  if (!monthlyInterestRate) return principal / paymentCount;

  return (principal * monthlyInterestRate) / (1 - ((1 + monthlyInterestRate) ** -paymentCount));
};

function MonthlyInstallmentPage() {
  const [interestRate, setInterestRate] = useState('4');
  const [loanTenure, setLoanTenure] = useState('35');
  const [packageInputs, setPackageInputs] = useState(monthlyInstallmentPackages);
  const [selectedPackageId, setSelectedPackageId] = useState(monthlyInstallmentPackages[0].id);
  const packages = packageInputs.map((item) => {
    const spaPrice = toAmount(item.spaPrice);
    const nett1 = spaPrice - (spaPrice * item.discountPercent / 100);
    const nett2 = nett1 - toAmount(item.nett2Deduction);
    const nett3 = nett2 - toAmount(item.nett3Deduction);

    return {
      ...item,
      spaPrice,
      nett1,
      nett2,
      nett3,
    };
  });
  const selectedPackage = packages.find((item) => item.id === selectedPackageId) || packages[0];
  const selectedMonthly = getMonthlyInstallment(selectedPackage.nett1, interestRate, loanTenure);
  const updatePackageSpaPrice = (packageId, value) => {
    setPackageInputs((currentPackages) => (
      currentPackages.map((item) => (
        item.id === packageId ? { ...item, spaPrice: value } : item
      ))
    ));
  };

  return (
    <>
      <PageHeader
        title="Monthly Installment"
        description="Sanderling installment guide based on the supplied Excel workbook."
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Sanderling</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Loan Installment Comparison</h2>
              <p className="mt-1 text-sm text-slate-500">Monthly values use the Excel PMT formula with editable rate and tenure.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Interest Rate</span>
                <div className="mt-2 grid h-10 grid-cols-[1fr_2rem] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={interestRate}
                    onChange={(event) => setInterestRate(event.target.value)}
                    className="min-w-0 border-0 bg-transparent px-3 text-sm font-bold text-slate-800 outline-none"
                    aria-label="Interest rate"
                  />
                  <span className="grid place-items-center text-sm font-bold text-slate-500">%</span>
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Loan Tenure</span>
                <div className="mt-2 grid h-10 grid-cols-[1fr_3.2rem] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus:ring-emerald-100">
                  <input
                    type="number"
                    min="1"
                    value={loanTenure}
                    onChange={(event) => setLoanTenure(event.target.value)}
                    className="min-w-0 border-0 bg-transparent px-3 text-sm font-bold text-slate-800 outline-none"
                    aria-label="Loan tenure"
                  />
                  <span className="grid place-items-center text-xs font-bold text-slate-500">years</span>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-amber-200">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-amber-200 text-center">
                  <th className="w-48 bg-white px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Package</th>
                  {packages.map((item) => (
                    <th key={item.id} className="bg-amber-100 px-4 py-3 font-bold text-amber-950">{item.type}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Unit', render: (item) => item.unit },
                  { label: 'Type', render: (item) => item.rooms },
                  { label: 'Size (SQF)', render: (item) => item.size.toLocaleString('en-MY') },
                  { label: 'Car Park (S/S)', render: (item) => item.carPark },
                  {
                    label: 'SPA Price',
                    render: (item) => (
                      <div className="ml-auto grid h-10 max-w-44 grid-cols-[2.4rem_1fr] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
                        <span className="grid place-items-center text-xs font-bold text-slate-500">RM</span>
                        <input
                          type="number"
                          min="0"
                          value={packageInputs.find((packageInput) => packageInput.id === item.id)?.spaPrice ?? ''}
                          onChange={(event) => updatePackageSpaPrice(item.id, event.target.value)}
                          className="min-w-0 border-0 bg-transparent px-2 text-right text-sm font-bold text-slate-950 outline-none"
                          aria-label={`${item.type} SPA price`}
                        />
                      </div>
                    ),
                    strong: true,
                  },
                  { label: '(-) 10%', render: (item) => `RM ${formatMoney(item.spaPrice * item.discountPercent / 100, 0)}` },
                  { label: 'Nett (1)', render: (item) => `RM ${formatMoney(item.nett1, 0)}`, highlight: true },
                  { label: '(-)', render: (item) => `RM ${formatMoney(item.nett2Deduction, 0)}` },
                  { label: 'Nett (2)', render: (item) => `RM ${formatMoney(item.nett2, 0)}`, highlight: true },
                  { label: '(-)', render: (item) => `RM ${formatMoney(item.nett3Deduction, 0)}` },
                  { label: 'Nett (3)', render: (item) => `RM ${formatMoney(item.nett3, 0)}`, highlight: true },
                  { label: 'RM 0.25 SQF', render: (item) => `RM ${formatMoney(item.size * 0.25, 2)}` },
                ].map((row) => (
                  <tr key={row.label} className={`border-b border-slate-100 ${row.highlight ? 'bg-emerald-50' : ''}`}>
                    <td className="px-4 py-3 font-bold text-slate-700">{row.label}</td>
                    {packages.map((item) => (
                      <td key={item.id} className={`px-4 py-3 text-right ${row.strong || row.highlight ? 'font-bold text-slate-950' : 'font-semibold text-slate-700'}`}>
                        {row.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <Calculator size={22} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-950">Quick Monthly</h2>
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Package</span>
            <select
              value={selectedPackageId}
              onChange={(event) => setSelectedPackageId(event.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              {packages.map((item) => (
                <option key={item.id} value={item.id}>{item.type} - {item.unit}</option>
              ))}
            </select>
          </label>
          <div className="mt-5 rounded-lg bg-slate-950 p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">Nett (1) Monthly</p>
            <p className="mt-2 text-3xl font-bold">RM {formatMoney(selectedMonthly, 2)}</p>
            <p className="mt-2 text-xs font-medium text-slate-300">Loan amount RM {formatMoney(selectedPackage.nett1, 0)}</p>
          </div>

          <div className="mt-5 space-y-3">
            {installmentScenarios.map((scenario) => (
              <div key={scenario.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">{scenario.label}</p>
                  <p className="text-xs text-slate-500">RM {formatMoney(selectedPackage[scenario.field], 0)}</p>
                </div>
                <p className="text-sm font-bold text-emerald-700">
                  RM {formatMoney(getMonthlyInstallment(selectedPackage[scenario.field], interestRate, loanTenure), 2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            <p className="font-bold">Free cost items</p>
            <p className="mt-1">SPA legal fee, SPA stamp duty, loan legal fee, and loan stamp duty.</p>
          </div>
        </aside>
      </section>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-slate-950">Monthly Breakdown</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 text-right font-bold">Loan Amount</th>
                <th className="px-4 py-3 text-right font-bold">Interest</th>
                <th className="px-4 py-3 text-right font-bold">Tenure</th>
                <th className="px-4 py-3 text-right font-bold">Monthly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packages.flatMap((item) => (
                installmentScenarios.map((scenario) => (
                  <tr key={`${item.id}-${scenario.id}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-950">{item.type} {scenario.label}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">RM {formatMoney(item[scenario.field], 0)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{toAmount(interestRate)}%</td>
                    <td className="px-4 py-3 text-right text-slate-600">{toAmount(loanTenure)} years</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">
                      RM {formatMoney(getMonthlyInstallment(item[scenario.field], interestRate, loanTenure), 2)}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(publicUser);
  const [token, setToken] = useState('');
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [propertyRecords, setPropertyRecords] = useState([]);
  const [agentRecords, setAgentRecords] = useState([]);
  const [dataError, setDataError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    status: '',
  });

  const loadData = async (authToken = token) => {
    try {
      setDataError('');
      const [propertyData, agentData] = await Promise.all([getProperties(authToken), getAgents()]);
      setPropertyRecords(propertyData.map((property) => ({
        ...property,
        isKiv: Boolean(property.isKiv),
        price: `RM ${Number(property.price).toLocaleString('en-MY')}`,
      })));
      setAgentRecords(agentData);
    } catch (requestError) {
      setDataError(requestError.message);
    }
  };

  useEffect(() => {
    loadData(token);
  }, [token]);

  useEffect(() => {
    const handleAdminShortcut = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a' && currentUser.role !== 'admin') {
        event.preventDefault();
        setIsAdminDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleAdminShortcut);
    return () => window.removeEventListener('keydown', handleAdminShortcut);
  }, [currentUser.role]);

  const filteredProperties = propertyRecords.filter((property) => {
    const searchText = [
      property.name,
      property.location,
      property.agent,
      property.price,
      property.status,
      property.updated,
      property.salesPackages?.map((item) => item.name).join(' '),
    ].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch = searchText.includes(filters.search.trim().toLowerCase());
    const locationSearch = filters.location.trim().toLowerCase();
    const matchesLocation = !locationSearch || property.location?.toLowerCase().includes(locationSearch);
    const matchesStatus = !filters.status || property.status === filters.status;

    return matchesSearch && matchesLocation && matchesStatus;
  });

  const handleFilterChange = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      status: '',
    });
  };

  const handleNavigate = (pageId) => {
    const targetPage = menuItems.find((item) => item.id === pageId);
    if (targetPage?.adminOnly && currentUser?.role !== 'admin') {
      setActivePage('dashboard');
      setIsSidebarOpen(false);
      return;
    }

    setActivePage(pageId);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(publicUser);
    setToken('');
    setActivePage('dashboard');
    setIsSidebarOpen(false);
    clearFilters();
  };

  const handleLogin = (user, authToken) => {
    setCurrentUser(user);
    setToken(authToken);
    setIsAdminDialogOpen(false);
  };

  const handleSaveProperty = async (property) => {
    const result = await createProperty(token, property);
    await loadData();
    return result;
  };

  const handleSaveAgent = async (agent) => {
    await createAgent(token, agent);
    await loadData();
  };

  const handleUpdateProperty = async (propertyId, property) => {
    const result = await updateProperty(token, propertyId, property);
    await loadData();
    return result;
  };

  const handleUpdatePropertyKiv = async (propertyId, isKiv) => {
    await updatePropertyKiv(token, propertyId, isKiv);
    await loadData();
  };

  const handleDeleteProperty = async (propertyId) => {
    await softDeleteProperty(token, propertyId);
    await loadData();
  };

  const isAdmin = currentUser.role === 'admin';

  const pageProps = {
    isAdmin,
    filters,
    filteredProperties,
    propertyRecords,
    onFilterChange: handleFilterChange,
    onClearFilters: clearFilters,
    onDelete: handleDeleteProperty,
    onEdit: handleUpdateProperty,
    onKiv: handleUpdatePropertyKiv,
    onNavigate: handleNavigate,
  };

  const pages = {
    dashboard: <DashboardPage {...pageProps} />,
    'property-listing': <PropertyListingPage {...pageProps} />,
    'add-property': <AddPropertyPage isAdmin={isAdmin} propertyRecords={propertyRecords} onSave={handleSaveProperty} />,
    agents: <AgentsPage agents={agentRecords} isAdmin={isAdmin} onSave={handleSaveAgent} />,
    reports: <ReportsPage properties={propertyRecords} />,
    'monthly-installment': <MonthlyInstallmentPage />,
    settings: <SettingsPage isAdmin={isAdmin} />,
  };

  return (
    <div className="brand-shell flex min-h-screen flex-col bg-slate-50">
      <TopNav
        activePage={activePage}
        currentUser={currentUser}
        isAdmin={isAdmin}
        isMenuOpen={isSidebarOpen}
        onNavigate={handleNavigate}
        onAdminAccess={() => setIsAdminDialogOpen(true)}
        onLogout={handleLogout}
        onMenuClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {dataError && (
          <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            Database connection error: {dataError}
          </p>
        )}

        <div key={activePage} className="page-transition">
          {pages[activePage]}
        </div>
      </main>
      <Footer />
      {isAdminDialogOpen && (
        <AdminLoginDialog onClose={() => setIsAdminDialogOpen(false)} onLogin={handleLogin} />
      )}
    </div>
  );
}
