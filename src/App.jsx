import { useState } from 'react';
import {
  Bell,
  Building2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Home,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  PlusCircle,
  Search,
  Settings,
  SlidersHorizontal,
  ShieldCheck,
  TrendingUp,
  Users,
  FileBarChart,
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'property-listing', label: 'Property Listing', icon: Building2 },
  { id: 'add-property', label: 'Add Property', icon: PlusCircle, adminOnly: true },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
  { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
];

const stats = [
  { label: 'Total Properties', value: '248', trend: '+12 this month', icon: Building2 },
  { label: 'Available Properties', value: '134', trend: '54% portfolio', icon: Home },
  { label: 'Booked Properties', value: '38', trend: '+7 pending deals', icon: SlidersHorizontal },
  { label: 'Sold Properties', value: '76', trend: 'RM 42.8M closed', icon: CircleDollarSign },
];

const properties = [
  {
    name: 'Seri Maya Residence',
    location: 'Kuala Lumpur',
    price: 'RM 780,000',
    status: 'Available',
    agent: 'Aina Roslan',
    updated: '03 Jun 2026',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Bangi Sentral Terrace',
    location: 'Bangi',
    price: 'RM 540,000',
    status: 'Booked',
    agent: 'Daniel Tan',
    updated: '02 Jun 2026',
    image:
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Cyberjaya Lakeview Suite',
    location: 'Cyberjaya',
    price: 'RM 420,000',
    status: 'Available',
    agent: 'Nur Iman',
    updated: '01 Jun 2026',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Elmina Green Villa',
    location: 'Shah Alam',
    price: 'RM 1,250,000',
    status: 'Sold',
    agent: 'Farid Hakim',
    updated: '30 May 2026',
    image:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Danga Bay Executive Condo',
    location: 'Johor Bahru',
    price: 'RM 680,000',
    status: 'Booked',
    agent: 'Mei Ling',
    updated: '29 May 2026',
    image:
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Mont Kiara Signature Loft',
    location: 'Kuala Lumpur',
    price: 'RM 980,000',
    status: 'Available',
    agent: 'Adam Zulkifli',
    updated: '27 May 2026',
    image:
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=80',
  },
];

const statusStyles = {
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Booked: 'bg-amber-50 text-amber-700 ring-amber-200',
  Sold: 'bg-red-50 text-red-700 ring-red-200',
};

const locations = [...new Set(properties.map((property) => property.location))];
const statuses = ['Available', 'Booked', 'Sold'];

const agents = [
  { name: 'Aina Roslan', region: 'Kuala Lumpur', phone: '+60 12-398 4410', email: 'aina@hartanahpro.my', listings: 42 },
  { name: 'Daniel Tan', region: 'Bangi', phone: '+60 13-712 8841', email: 'daniel@hartanahpro.my', listings: 31 },
  { name: 'Nur Iman', region: 'Cyberjaya', phone: '+60 17-604 2809', email: 'iman@hartanahpro.my', listings: 27 },
  { name: 'Farid Hakim', region: 'Shah Alam', phone: '+60 19-845 1205', email: 'farid@hartanahpro.my', listings: 35 },
];

const demoUsers = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'Admin Manager',
    role: 'admin',
    title: 'System Administrator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
  {
    username: 'agent',
    password: 'agent123',
    name: 'Aina Roslan',
    role: 'agent',
    title: 'Sales Agent',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
  },
];

const pageTitles = {
  dashboard: 'Property Dashboard',
  'property-listing': 'Property Listing',
  'add-property': 'Add Property',
  agents: 'Agents',
  reports: 'Reports',
  settings: 'Settings',
};

function LoginPage({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const user = demoUsers.find(
      (demoUser) =>
        demoUser.username === credentials.username.trim().toLowerCase() &&
        demoUser.password === credentials.password
    );

    if (!user) {
      setError('Invalid username or password.');
      return;
    }

    setError('');
    onLogin(user);
  };

  return (
    <main className="grid min-h-screen bg-slate-50 px-4 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-8">
      <section className="hidden items-center justify-center rounded-lg bg-slate-950 p-8 text-white md:flex">
        <div className="max-w-lg">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-500 text-slate-950">
              <Building2 size={26} />
            </div>
            <div>
              <p className="text-xl font-bold">HartanahPro</p>
              <p className="text-sm text-slate-400">Real Estate CRM</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold leading-tight">Secure property management for Malaysian real estate teams.</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Admin users can manage company and property information. Agents can review portfolio data without editing records.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-6">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <LockKeyhole size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-950">Login</h2>
            <p className="mt-1 text-sm text-slate-500">Use a demo account to access the dashboard.</p>
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

          <button className="mt-5 h-11 w-full rounded-lg bg-emerald-500 text-sm font-bold text-slate-950 transition hover:bg-emerald-400">
            Sign In
          </button>

          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-bold text-slate-950">Demo accounts</p>
            <p className="mt-2">Admin: admin / admin123</p>
            <p>Agent: agent / agent123</p>
          </div>
        </form>
      </section>
    </main>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function Sidebar({ activePage, isAdmin, mobile = false, onNavigate }) {
  const visibleMenuItems = menuItems.filter((item) => isAdmin || !item.adminOnly);

  return (
    <aside className={`${mobile ? 'block h-full' : 'hidden lg:block'} w-72 shrink-0 border-r border-slate-200 bg-slate-950 px-4 py-5 text-white`}>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-500 text-slate-950">
          <Building2 size={24} strokeWidth={2.4} />
        </div>
        <div>
          <p className="text-lg font-bold leading-tight">HartanahPro</p>
          <p className="text-xs font-medium text-slate-400">Real Estate CRM</p>
        </div>
      </div>

      <nav className="space-y-1">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${
                activePage === item.id
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/20'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon size={19} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function TopNav({ activePage, currentUser, onLogout, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-emerald-400">
              <Building2 size={21} />
            </div>
            <span className="hidden text-base font-bold text-slate-950 sm:inline">HartanahPro</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-500">Welcome back, {currentUser.name}</p>
            <h1 className="text-2xl font-bold tracking-normal text-slate-950">{pageTitles[activePage]}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
            <Bell size={19} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-500" />
          </button>
          <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-left sm:flex">
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={currentUser.avatar}
              alt="User avatar"
            />
            <div className="hidden leading-tight md:block">
              <p className="text-sm font-bold text-slate-950">{currentUser.name}</p>
              <p className="text-xs text-slate-500">{currentUser.title}</p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          <button
            onClick={onLogout}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <LogOut size={17} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
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

function Filters({ filters, onFilterChange, onClearFilters, resultCount }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
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
        <select
          value={filters.location}
          onChange={(event) => onFilterChange('location', event.target.value)}
          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Filter by Location</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
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

function RecentPropertiesTable({ properties }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Recent Properties</h2>
          <p className="text-sm text-slate-500">Latest portfolio updates from active agents</p>
        </div>
        <button className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Property Name</th>
              <th className="px-5 py-3 font-bold">Location</th>
              <th className="px-5 py-3 font-bold">Price</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold">Agent</th>
              <th className="px-5 py-3 font-bold">Updated Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {properties.slice(0, 5).map((property) => (
              <tr key={property.name} className="transition hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-slate-950">{property.name}</td>
                <td className="px-5 py-4 text-slate-600">{property.location}</td>
                <td className="px-5 py-4 font-semibold text-slate-800">{property.price}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={property.status} />
                </td>
                <td className="px-5 py-4 text-slate-600">{property.agent}</td>
                <td className="px-5 py-4 text-slate-600">{property.updated}</td>
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

function PropertyCard({ property }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img className="h-full w-full object-cover" src={property.image} alt={property.name} />
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-950">{property.name}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{property.location}</p>
          </div>
          <StatusBadge status={property.status} />
        </div>
        <p className="text-xl font-bold text-slate-950">{property.price}</p>
        <button className="mt-4 h-10 w-full rounded-lg bg-slate-950 text-sm font-bold text-white transition hover:bg-emerald-600">
          View Details
        </button>
      </div>
    </article>
  );
}

function PageHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">HartanahPro CRM</p>
        <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function DashboardPage({
  isAdmin,
  filters,
  filteredProperties,
  onFilterChange,
  onClearFilters,
  onNavigate,
}) {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <div className="mt-6">
        <Filters
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          resultCount={filteredProperties.length}
        />
      </div>

      <div className="mt-6">
        <RecentPropertiesTable properties={filteredProperties} />
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
        <PropertyCardGrid properties={filteredProperties} />
      </section>
    </>
  );
}

function PropertyCardGrid({ properties }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard key={property.name} property={property} />
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

function PropertyListingPage({ filters, filteredProperties, onFilterChange, onClearFilters }) {
  return (
    <>
      <PageHeader
        title="Property Listing"
        description="Review and filter all active Malaysian property records."
      />
      <Filters
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        resultCount={filteredProperties.length}
      />
      <div className="mt-6">
        <RecentPropertiesTable properties={filteredProperties} />
      </div>
      <section className="mt-6">
        <PropertyCardGrid properties={filteredProperties} />
      </section>
    </>
  );
}

function AddPropertyPage({ isAdmin }) {
  return (
    <>
      <PageHeader
        title="Add Property"
        description="Capture a new listing before it moves into review and publication."
      />
      <PermissionNotice isAdmin={isAdmin} />
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          {['Property Name', 'Location', 'Price', 'Agent Name'].map((label) => (
            <label key={label} className="block">
              <span className="text-sm font-bold text-slate-700">{label}</span>
              <input
                disabled={!isAdmin}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder={label}
              />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Status</span>
            <select
              disabled={!isAdmin}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Property Image URL</span>
            <input
              disabled={!isAdmin}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="https://..."
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Notes</span>
            <textarea
              disabled={!isAdmin}
              className="mt-2 min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Internal listing notes"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            disabled={!isAdmin}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            <PlusCircle size={17} />
            Save Property
          </button>
        </div>
      </section>
    </>
  );
}

function AgentsPage() {
  return (
    <>
      <PageHeader title="Agents" description="Monitor agent coverage, contacts, and active listings." />
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

function ReportsPage() {
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
            const percentage = Math.round((count / properties.length) * 100);
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
                  defaultValue={label === 'Company Name' ? 'HartanahPro Realty' : ''}
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

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    status: '',
  });

  const filteredProperties = properties.filter((property) => {
    const searchText = `${property.name} ${property.location} ${property.agent}`.toLowerCase();
    const matchesSearch = searchText.includes(filters.search.trim().toLowerCase());
    const matchesLocation = !filters.location || property.location === filters.location;
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
    setCurrentUser(null);
    setActivePage('dashboard');
    setIsSidebarOpen(false);
    clearFilters();
  };

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  const isAdmin = currentUser.role === 'admin';

  const pageProps = {
    isAdmin,
    filters,
    filteredProperties,
    onFilterChange: handleFilterChange,
    onClearFilters: clearFilters,
    onNavigate: handleNavigate,
  };

  const pages = {
    dashboard: <DashboardPage {...pageProps} />,
    'property-listing': <PropertyListingPage {...pageProps} />,
    'add-property': <AddPropertyPage isAdmin={isAdmin} />,
    agents: <AgentsPage />,
    reports: <ReportsPage />,
    settings: <SettingsPage isAdmin={isAdmin} />,
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar activePage={activePage} isAdmin={isAdmin} onNavigate={handleNavigate} />
      <div className="min-w-0 flex-1">
        <TopNav
          activePage={activePage}
          currentUser={currentUser}
          onLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="px-4 py-5 md:px-6 lg:px-8">
          <div className="mb-5 md:hidden">
            <p className="text-sm font-medium text-slate-500">Welcome back, {currentUser.name}</p>
            <h1 className="text-2xl font-bold text-slate-950">{pageTitles[activePage]}</h1>
          </div>

          {pages[activePage]}
        </main>
      </div>
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            className="absolute inset-0 h-full w-full bg-slate-950/50"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <div className="relative h-full w-72 shadow-2xl">
            <Sidebar activePage={activePage} isAdmin={isAdmin} mobile onNavigate={handleNavigate} />
          </div>
        </div>
      )}
    </div>
  );
}
