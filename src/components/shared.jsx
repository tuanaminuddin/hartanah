import { useEffect, useRef, useState } from 'react';
import { login } from '../api.js';
import { getPagePath } from '../routes.js';
import {
  Bold,
  Building2,
  BriefcaseBusiness,
  Calculator,
  Camera,
  CheckSquare,
  CircleDollarSign,
  Clock,
  Code2,
  Eye,
  FileText,
  Image as ImageIcon,
  Italic,
  LayoutDashboard,
  Link2,
  List,
  ListOrdered,
  LogIn,
  LogOut,
  MapPinned,
  MapPin,
  Menu,
  MessageCircle,
  MoreVertical,
  Pencil,
  Play,
  PlusCircle,
  Quote,
  RemoveFormatting,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Strikethrough,
  Trash2,
  Users,
  X,
} from 'lucide-react';
export const menuItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'property-listing', label: 'Property Listing', icon: Building2 },
  { id: 'add-property', label: 'Add Property', icon: PlusCircle, adminOnly: true },
  { id: 'agents', label: 'Add Agent', icon: Users, adminOnly: true },
  { id: 'monthly-installment', label: 'Monthly Installment', icon: Calculator },
  { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
];

const publicMenuItems = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'about', label: 'About', icon: BriefcaseBusiness },
  { id: 'services', label: 'How We Help', icon: Building2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'contact', label: 'Contact', icon: MessageCircle },
];

export const statusStyles = {
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Not Available': 'bg-slate-100 text-slate-700 ring-slate-300',
  Booked: 'bg-amber-50 text-amber-700 ring-amber-200',
  Sold: 'bg-red-50 text-red-700 ring-red-200',
};

export const statuses = ['Available', 'Not Available'];

const richTextTags = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DIV', 'EM', 'H2', 'H3', 'IMG', 'LI',
  'OL', 'P', 'PRE', 'S', 'STRONG', 'U', 'UL',
]);

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const normalizeRichText = (value) => {
  const text = String(value || '');
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return text.split(/\r?\n/).map((line) => `<div>${escapeHtml(line) || '<br>'}</div>`).join('');
};

export const sanitizeRichText = (value, normalizePlainText = true) => {
  if (typeof document === 'undefined') return String(value || '');

  const container = document.createElement('div');
  container.innerHTML = normalizePlainText ? normalizeRichText(value) : String(value || '');

  const cleanNode = (node) => {
    Array.from(node.children).forEach((child) => {
      cleanNode(child);

      if (!richTextTags.has(child.tagName)) {
        child.replaceWith(...child.childNodes);
        return;
      }

      Array.from(child.attributes).forEach((attribute) => {
        const allowed = (
          (child.tagName === 'A' && ['href', 'target', 'rel'].includes(attribute.name))
          || (child.tagName === 'IMG' && ['src', 'alt'].includes(attribute.name))
          || (child.tagName === 'UL' && attribute.name === 'data-list')
        );
        if (!allowed) child.removeAttribute(attribute.name);
      });

      if (child.tagName === 'A') {
        const href = child.getAttribute('href') || '';
        if (!/^(https?:\/\/|mailto:|tel:)/i.test(href)) child.removeAttribute('href');
        child.setAttribute('target', '_blank');
        child.setAttribute('rel', 'noopener noreferrer');
      }

      if (child.tagName === 'IMG') {
        const src = child.getAttribute('src') || '';
        if (!/^https?:\/\//i.test(src)) child.remove();
      }
    });
  };

  cleanNode(container);
  return container.innerHTML;
};

export function RichTextEditor({ value, onChange, disabled = false, placeholder = '' }) {
  const editorRef = useRef(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!editorRef.current || editorRef.current === document.activeElement) return;
    const nextHtml = sanitizeRichText(value);
    if (editorRef.current.innerHTML !== nextHtml) editorRef.current.innerHTML = nextHtml;
  }, [value]);

  const syncValue = () => {
    if (!editorRef.current) return;
    const html = sanitizeRichText(editorRef.current.innerHTML, false);
    onChange(html === '<br>' ? '' : html);
  };

  const runCommand = (command, commandValue = null) => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    syncValue();
  };

  const insertLink = () => {
    const url = window.prompt('Enter a web address (https://...)');
    if (!url) return;
    const safeUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    runCommand('createLink', safeUrl);
  };

  const insertImage = () => {
    const url = window.prompt('Enter an image web address (https://...)');
    if (!url) return;
    const safeUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    runCommand('insertImage', safeUrl);
  };

  const insertChecklist = () => {
    runCommand('insertHTML', '<ul data-list="check"><li>Checklist item</li></ul>');
  };

  const toolbarButton = (label, Icon, onClick) => (
    <button
      key={label}
      type="button"
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="grid h-9 w-9 shrink-0 place-items-center border-l border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300"
      aria-label={label}
      title={label}
    >
      <Icon size={17} />
    </button>
  );

  return (
    <div className={`mt-2 overflow-hidden rounded-lg border bg-slate-50 transition focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100 ${disabled ? 'border-slate-200 opacity-70' : 'border-slate-200'}`}>
      <div className="flex min-h-10 items-center overflow-x-auto border-b border-slate-200 bg-white">
        <select
          disabled={disabled}
          defaultValue="div"
          onChange={(event) => runCommand('formatBlock', event.target.value)}
          className="h-9 min-w-36 border-0 bg-transparent px-3 text-sm text-slate-700 outline-none disabled:cursor-not-allowed"
          aria-label="Text style"
        >
          <option value="div">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code block</option>
        </select>
        {toolbarButton('Bold', Bold, () => runCommand('bold'))}
        {toolbarButton('Italic', Italic, () => runCommand('italic'))}
        {toolbarButton('Strikethrough', Strikethrough, () => runCommand('strikeThrough'))}
        {toolbarButton('Inline code', Code2, () => runCommand('insertHTML', `<code>${escapeHtml(window.getSelection()?.toString() || 'code')}</code>`))}
        {toolbarButton('Link', Link2, insertLink)}
        {toolbarButton('Bulleted list', List, () => runCommand('insertUnorderedList'))}
        {toolbarButton('Numbered list', ListOrdered, () => runCommand('insertOrderedList'))}
        {toolbarButton('Checklist', CheckSquare, insertChecklist)}
        {toolbarButton('Image', ImageIcon, insertImage)}
        {toolbarButton('Quote', Quote, () => runCommand('formatBlock', 'blockquote'))}
        {toolbarButton('More formatting', MoreVertical, () => setShowMore((current) => !current))}
        {showMore && toolbarButton('Clear formatting', RemoveFormatting, () => runCommand('removeFormat'))}
      </div>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={syncValue}
        onBlur={syncValue}
        data-placeholder={placeholder}
        className="rich-text-editor min-h-48 w-full px-3 py-3 text-sm leading-6 text-slate-700 outline-none"
        aria-label="Notes"
      />
    </div>
  );
}

export const getFileType = (file, fallbackType = 'application/octet-stream') => {
  if (file.type) return file.type;
  if (file.name.toLowerCase().endsWith('.pdf')) return 'application/pdf';
  return fallbackType;
};

export const malaysiaLocationOptions = [
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

export const getLocationOptions = (locations = []) => (
  [...new Set([...malaysiaLocationOptions, ...locations].filter(Boolean))].sort((first, second) => (
    first.localeCompare(second)
  ))
);

export const publicUser = {
  name: 'Visitor',
  role: 'public',
  title: 'Public Access',
};

export function AdminLoginDialog({ onClose, onLogin }) {
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
      <button className="absolute inset-0 h-full w-full" onClick={onClose} aria-label="Close sign in" />
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
            <h2 className="text-2xl font-bold text-slate-950">Portal Sign In</h2>
            <p className="mt-1 text-sm text-slate-500">Use your admin or agent account to continue.</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Username</span>
              <input
                value={credentials.username}
                onChange={(event) => setCredentials({ ...credentials, username: event.target.value })}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="Username"
                autoComplete="username"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Password</span>
              <input
                type="password"
                value={credentials.password}
                onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="Password"
                autoComplete="current-password"
                required
              />
            </label>
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

          <button disabled={isLoading} className="mt-5 h-11 w-full rounded-lg bg-emerald-500 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

      </form>
    </div>
  );
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status] || statusStyles.Available}`}
    >
      {status}
    </span>
  );
}

export function TopNav({
  activePage,
  currentUser,
  isAdmin,
  isMenuOpen,
  onNavigate,
  onAdminAccess,
  onLogout,
  onMenuClick,
}) {
  const isSignedIn = currentUser.role !== 'public';
  const visibleMenuItems = menuItems.filter((item) => (
    item.id === 'dashboard' || (isSignedIn && (isAdmin || !item.adminOnly))
  ));
  const handlePublicSectionClick = (event, sectionId) => {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (isMenuOpen) onMenuClick();
  };

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
          <a
            href={getPagePath('dashboard')}
            onClick={(event) => {
              event.preventDefault();
              onNavigate('dashboard');
            }}
            className="glass-brand flex min-w-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-left transition"
            aria-label="Open dashboard"
          >
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/70 bg-white/60">
              <img className="h-full w-full object-cover" src="/images/logo_infinite.jpeg" alt="Infinite team" />
            </div>
            <span className="truncate text-sm font-bold text-slate-950">Infinite Property</span>
          </a>
        </div>

        <nav className="simple-tab-bar hidden items-center justify-center gap-1 lg:flex">
          {(isSignedIn ? visibleMenuItems : publicMenuItems).map((item) => (
            <a
              key={item.id}
              href={isSignedIn ? getPagePath(item.id) : `#${item.id}`}
              onClick={(event) => {
                if (!isSignedIn) {
                  handlePublicSectionClick(event, item.id);
                  return;
                }
                event.preventDefault();
                onNavigate(item.id);
              }}
              className={`simple-tab inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold ${
                isSignedIn && activePage === item.id
                  ? 'simple-tab-active'
                  : ''
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1">
          <button
            onClick={isSignedIn ? onLogout : onAdminAccess}
            className="glass-icon-button inline-flex h-9 items-center justify-center gap-2 rounded-full px-3 text-slate-900 transition"
            aria-label={isSignedIn ? 'Sign out' : 'Sign in'}
            title={isSignedIn ? `Sign out ${currentUser.username || currentUser.name}` : 'Portal sign in'}
          >
            {isSignedIn ? <LogOut size={18} /> : <LogIn size={17} />}
            <span className="hidden text-xs font-bold sm:inline">{isSignedIn ? 'Sign out' : 'Team login'}</span>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="glass-menu absolute left-0 right-0 top-full px-4 py-3 lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1">
            {(isSignedIn ? visibleMenuItems : publicMenuItems).map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={isSignedIn ? getPagePath(item.id) : `#${item.id}`}
                  onClick={(event) => {
                    if (!isSignedIn) {
                      handlePublicSectionClick(event, item.id);
                      return;
                    }
                    event.preventDefault();
                    onNavigate(item.id);
                  }}
                  className={`simple-tab flex h-11 items-center gap-3 rounded-full px-4 text-left text-sm font-semibold ${
                    isSignedIn && activePage === item.id
                      ? 'simple-tab-active'
                      : ''
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
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

export function PermissionNotice({ isAdmin }) {
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

export function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/60 bg-white/25 p-5 text-slate-950 shadow-[0_22px_55px_rgba(15,23,42,0.18)] ring-1 ring-white/40 backdrop-blur-2xl backdrop-saturate-150 before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-white/80 after:absolute after:-right-10 after:-top-12 after:h-28 after:w-28 after:rounded-full after:bg-white/30 after:blur-2xl">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-stone-600">{stat.label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{stat.value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/60 bg-white/40 text-amber-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <Icon size={22} />
        </div>
      </div>
      <p className="relative z-10 mt-4 text-sm font-bold text-amber-800">{stat.trend}</p>
    </div>
  );
}

export function MalaysiaLocationInput({
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

export function Filters({ filters, locations, onFilterChange, onClearFilters, resultCount }) {
  return (
    <section className="relative z-20 overflow-visible rounded-lg border border-white/60 bg-white/25 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.18)] ring-1 ring-white/40 backdrop-blur-2xl backdrop-saturate-150 before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-white/80">
      <div className="relative z-10 grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto_auto]">
        <label className="relative block min-w-0">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-stone-500" size={18} />
          <MalaysiaLocationInput
            id="property-location-filter"
            value={filters.location}
            onChange={(value) => onFilterChange('location', value)}
            locations={locations}
            placeholder="Search location"
            className="h-12 w-full rounded-lg border border-white/40 bg-white/40 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_24px_rgba(15,23,42,0.08)] outline-none backdrop-blur-xl transition placeholder:text-stone-500 focus:border-amber-300 focus:bg-white/60 focus:ring-4 focus:ring-amber-200/30"
          />
        </label>
        <label className="relative block min-w-0">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-stone-500" size={18} />
          <select
            value={filters.status}
            onChange={(event) => onFilterChange('status', event.target.value)}
            className="h-12 w-full appearance-none rounded-lg border border-white/40 bg-white/40 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_24px_rgba(15,23,42,0.08)] outline-none backdrop-blur-xl transition focus:border-amber-300 focus:bg-white/60 focus:ring-4 focus:ring-amber-200/30"
          >
            <option value="">Property Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="relative block min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-stone-500" size={18} />
          <input
            value={filters.search}
            onChange={(event) => onFilterChange('search', event.target.value)}
            className="h-12 w-full rounded-lg border border-white/40 bg-white/40 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_24px_rgba(15,23,42,0.08)] outline-none backdrop-blur-xl transition placeholder:text-stone-500 focus:border-amber-300 focus:bg-white/60 focus:ring-4 focus:ring-amber-200/30"
            placeholder="Search property"
          />
        </label>
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 text-sm font-bold text-white shadow-[0_14px_30px_rgba(180,115,22,0.32)] transition hover:bg-amber-400"
        >
          <Search size={17} />
          Search
        </button>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/25 px-4 text-sm font-bold text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] transition hover:bg-white/40 hover:text-slate-950"
        >
          <X size={17} />
          Reset
        </button>
      </div>

      <div className="relative z-10 mt-3 flex justify-end">
        <p className="shrink-0 text-sm font-bold text-stone-600">{resultCount} properties found</p>
      </div>
    </section>
  );
}

export function RecentPropertiesTable({ properties, isAdmin = false, limit = 5, onDelete, onEdit, onKiv, onViewDetails }) {
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

export function PropertyCard({ property, isAdmin = false, onEdit, onViewDetails }) {
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

export function PageHeader({ title, description, action, backgroundImage, children }) {
  const headerStyle = backgroundImage
    ? { backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.76) 34%, rgba(255, 255, 255, 0.18) 64%, rgba(255, 255, 255, 0.02) 100%), url("${backgroundImage}")` }
    : undefined;

  return (
    <section
      className={`mb-8 flex flex-col gap-8 ${
        backgroundImage
          ? 'min-h-[28rem] justify-between overflow-hidden rounded-lg border border-white/80 bg-cover bg-center px-5 py-6 shadow-[0_28px_70px_rgba(15,23,42,0.16)] ring-1 ring-slate-950/5 md:min-h-[34rem] md:px-10 md:py-10 lg:px-12'
          : 'py-4 sm:flex-row sm:items-end sm:justify-between'
      }`}
      style={headerStyle}
    >
      <div className={backgroundImage ? 'flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between' : undefined}>
        <div className={backgroundImage ? 'max-w-2xl' : undefined}>
          <p className="text-sm font-bold text-stone-500">Infinite Property Team | FLP Agency</p>
          <h1 className="mt-4 text-5xl font-semibold leading-none text-slate-950 md:text-7xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-stone-500 md:text-lg">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}


export function PropertyCardGrid({ properties, isAdmin = false, onEdit, onViewDetails }) {
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

export function KivPropertyDialog({ property, onClose, onSave }) {
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

export function EditPropertyDialog({ property, locations = [], onClose, onSave }) {
  let savedCalculators = [defaultSalesCalculator];
  try {
    savedCalculators = normalizeSalesCalculators(property.salesPackageCalculator);
    if (!savedCalculators.length) savedCalculators = [defaultSalesCalculator];
  } catch {
    savedCalculators = [defaultSalesCalculator];
  }

  const [form, setForm] = useState({
    name: property.name || '',
    location: property.location || '',
    price: String(property.price || '').replace(/[^\d.]/g, ''),
    status: statuses.includes(property.status) ? property.status : 'Not Available',
    developer: property.agent || '',
    image: property.image || '',
    remarks: property.remarks || '',
  });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [projectImages, setProjectImages] = useState([]);
  const [salesPackages, setSalesPackages] = useState([]);
  const [salesCalculator, setSalesCalculator] = useState(() => JSON.parse(JSON.stringify(savedCalculators[0])));
  const projectImagesInput = useRef(null);
  const salesPackageInput = useRef(null);
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const salesCalculatorResults = getSalesCalculatorResults(salesCalculator);
  const buyerTypes = getSalesCalculatorBuyerTypes(salesCalculator);
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
      rebateRows: [...current.rebateRows, createSalesCalculatorRow(current.buyerTypes)],
    }));
  };
  const removeRebateRow = (rowId) => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: current.rebateRows.filter((row) => row.id !== rowId),
    }));
  };
  const addBuyerType = () => {
    const buyerType = createSalesCalculatorBuyerType();
    setSalesCalculator((current) => ({
      ...current,
      buyerTypes: [...getSalesCalculatorBuyerTypes(current), buyerType],
      spaPrices: { ...current.spaPrices, [buyerType.id]: '' },
      rebateRows: current.rebateRows.map((row) => ({
        ...row,
        values: { ...row.values, [buyerType.id]: '' },
      })),
    }));
  };
  const updateBuyerType = (buyerTypeId, label) => {
    setSalesCalculator((current) => ({
      ...current,
      buyerTypes: getSalesCalculatorBuyerTypes(current).map((buyerType) => (
        buyerType.id === buyerTypeId ? { ...buyerType, label } : buyerType
      )),
    }));
  };
  const removeBuyerType = (buyerTypeId) => {
    setSalesCalculator((current) => ({
      ...current,
      buyerTypes: getSalesCalculatorBuyerTypes(current).filter((buyerType) => buyerType.id !== buyerTypeId),
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
        salesPackageCalculator: [salesCalculator, ...savedCalculators.slice(1)],
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
          <div className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Notes</span>
            <RichTextEditor
              value={form.remarks}
              onChange={(value) => updateField('remarks', value)}
              placeholder="Add any project notes. Full web links become clickable in Property Details."
            />
          </div>
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
              <table className="min-w-[720px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-amber-200 text-center text-xs font-bold text-slate-600">
                    <th className="w-64 bg-white px-3 py-2 text-left">Buyer Type</th>
                    {buyerTypes.map((buyerType) => (
                      <th key={buyerType.id} className="bg-emerald-100 px-2 py-2">
                        <div className="flex min-w-40 items-center gap-2">
                          <input
                            value={buyerType.label}
                            onChange={(event) => updateBuyerType(buyerType.id, event.target.value)}
                            className="h-9 w-full rounded-md border border-emerald-200 bg-white px-2 text-center text-xs font-bold text-emerald-950 outline-none focus:border-emerald-500"
                            placeholder="Buyer type"
                            aria-label="Buyer type name"
                          />
                          <button
                            disabled={buyerTypes.length === 1}
                            type="button"
                            onClick={() => removeBuyerType(buyerType.id)}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-emerald-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Remove ${buyerType.label || 'buyer type'}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="px-3 py-2 font-bold text-slate-700">SPA Price</td>
                    {buyerTypes.map((buyerType) => (
                      <td key={buyerType.id} className="px-2 py-2">
                        <input
                          type="number"
                          value={salesCalculator.spaPrices[buyerType.id] || ''}
                          onChange={(event) => updateSalesCalculatorColumn('spaPrices', buyerType.id, event.target.value)}
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
                      {buyerTypes.map((buyerType) => {
                        const rowValue = toAmount(row.values?.[buyerType.id]);
                        const rowAmount = salesCalculatorResults[buyerType.id].rebates[row.id];
                        return (
                          <td key={buyerType.id} className="px-2 py-2">
                            <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                value={row.values?.[buyerType.id] || ''}
                                onChange={(event) => updateRebateRow(row.id, buyerType.id, event.target.value)}
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
                    {buyerTypes.map((buyerType) => (
                      <td key={buyerType.id} className="px-3 py-2 text-right font-bold text-slate-950">
                        {formatMoney(salesCalculatorResults[buyerType.id].totalRebates)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50">
                    <td className="px-3 py-3 font-bold text-emerald-950">Net to Buyer Price</td>
                    {buyerTypes.map((buyerType) => (
                      <td key={buyerType.id} className="px-3 py-3 text-right font-bold text-emerald-950">
                        {formatMoney(salesCalculatorResults[buyerType.id].netBuyerPrice)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap justify-start gap-2">
              <button
                type="button"
                onClick={addBuyerType}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
              >
                <PlusCircle size={16} />
                Add Buyer Type
              </button>
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

export function ProjectImagePreviews({ images }) {
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

const legacySalesPackageColumns = [
  { id: 'intermediateBumi', lot: 'Intermediate Lot', buyer: 'Bumi' },
  { id: 'intermediateNonBumi', lot: 'Intermediate Lot', buyer: 'Non-Bumi' },
  { id: 'endBumi', lot: 'End Lot', buyer: 'Bumi' },
  { id: 'endNonBumi', lot: 'End Lot', buyer: 'Non-Bumi' },
];

export const defaultSalesCalculator = {
  simulationName: '20x60',
  buyerTypes: [
    { id: 'bumi', label: 'Bumi' },
    { id: 'nonBumi', label: 'Non-Bumi' },
  ],
  spaPrices: {
    bumi: '682800',
    nonBumi: '682800',
  },
  rebateRows: [
    {
      id: 'bumiRebate',
      label: 'Bumi Rebate',
      type: 'percent',
      values: { bumi: '7', nonBumi: '' },
    },
    {
      id: 'rebate',
      label: 'Rebate',
      type: 'percent',
      values: { bumi: '13', nonBumi: '13' },
    },
    {
      id: 'conditionalRebate',
      label: 'Conditional Rebate',
      type: 'percent',
      values: { bumi: '3', nonBumi: '3' },
    },
    {
      id: 'conversionIncentive',
      label: 'Conversion Incentive',
      type: 'amount',
      values: { bumi: '', nonBumi: '' },
    },
  ],
};

export const createSalesCalculatorRow = (buyerTypes = defaultSalesCalculator.buyerTypes) => ({
  id: `custom-${Date.now()}`,
  label: '',
  type: 'percent',
  values: buyerTypes.reduce((values, buyerType) => ({ ...values, [buyerType.id]: '' }), {}),
});

export const createSalesCalculatorBuyerType = () => ({
  id: `buyer-${Date.now()}`,
  label: '',
});

export const getSalesCalculatorBuyerTypes = (calculator) => (
  Array.isArray(calculator?.buyerTypes) && calculator.buyerTypes.length
    ? calculator.buyerTypes
    : legacySalesPackageColumns.map((column) => ({
      id: column.id,
      label: `${column.lot} - ${column.buyer}`,
    }))
);

export const toAmount = (value) => {
  const amount = Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(amount) ? amount : 0;
};

export const formatMoney = (value, decimals = 2) => (
  value.toLocaleString('en-MY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
);

export const getSalesCalculatorResults = (calculator) => (
  getSalesCalculatorBuyerTypes(calculator).reduce((results, buyerType) => {
    const spaPrice = toAmount(calculator.spaPrices[buyerType.id]);
    let remainingPrice = spaPrice;
    let totalRebates = 0;

    const rebates = calculator.rebateRows.reduce((rowResults, row) => {
      const rowValue = toAmount(row.values?.[buyerType.id]);
      const rebateAmount = row.type === 'percent' ? remainingPrice * (rowValue / 100) : rowValue;
      remainingPrice -= rebateAmount;
      totalRebates += rebateAmount;
      return { ...rowResults, [row.id]: rebateAmount };
    }, {});

    return {
      ...results,
      [buyerType.id]: {
        spaPrice,
        rebates,
        totalRebates,
        netBuyerPrice: spaPrice - totalRebates,
      },
    };
  }, {})
);

export const normalizeSalesCalculators = (calculator) => {
  if (!calculator) return [];

  const parsedCalculator = typeof calculator === 'string' ? JSON.parse(calculator) : calculator;
  const calculators = Array.isArray(parsedCalculator)
    ? parsedCalculator
    : (Array.isArray(parsedCalculator?.calculators) ? parsedCalculator.calculators : [parsedCalculator]);

  return calculators
    .filter((item) => item?.spaPrices && Array.isArray(item.rebateRows))
    .map((item) => ({
      ...item,
      buyerTypes: getSalesCalculatorBuyerTypes(item),
    }));
};

export const normalizeSalesCalculator = (calculator) => normalizeSalesCalculators(calculator)[0] || null;

export function SalesPackageCalculatorSummary({ calculator }) {
  let salesCalculators = [];

  try {
    salesCalculators = normalizeSalesCalculators(calculator);
  } catch {
    salesCalculators = [];
  }

  if (!salesCalculators.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
        <p className="text-sm font-bold text-slate-700">No sales package calculator saved</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {salesCalculators.map((salesCalculator, calculatorIndex) => {
        const results = getSalesCalculatorResults(salesCalculator);
        const buyerTypes = getSalesCalculatorBuyerTypes(salesCalculator);
        return (
    <div key={salesCalculator.calculatorId || calculatorIndex} className="overflow-x-auto rounded-lg border border-amber-200 bg-white">
      <table className="min-w-[720px] w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-amber-200 text-center">
            <th className="w-56 bg-white px-3 py-2 text-left text-xs font-bold uppercase text-slate-500">
              {salesCalculator.simulationName || 'Simulation'}
            </th>
            {buyerTypes.map((buyerType) => (
              <th key={buyerType.id} className="bg-emerald-100 px-3 py-2 font-bold text-emerald-950">
                {buyerType.label || 'Buyer Type'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="px-3 py-2 font-bold text-slate-700">SPA Price</td>
            {buyerTypes.map((buyerType) => (
              <td key={buyerType.id} className="px-3 py-2 text-right font-bold text-slate-800">
                {formatMoney(results[buyerType.id].spaPrice)}
              </td>
            ))}
          </tr>
          {salesCalculator.rebateRows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100">
              <td className="px-3 py-2 font-bold text-slate-700">
                {row.label || 'Selection'}
                <span className="ml-2 text-xs font-semibold text-slate-400">{row.type === 'percent' ? '%' : 'RM'}</span>
              </td>
              {buyerTypes.map((buyerType) => {
                const rowValue = toAmount(row.values?.[buyerType.id]);
                return (
                  <td key={buyerType.id} className="px-3 py-2 text-right text-slate-700">
                    {rowValue ? formatMoney(results[buyerType.id].rebates[row.id]) : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="border-b border-slate-200 bg-slate-50">
            <td className="px-3 py-2 font-bold text-slate-950">Total Rebates</td>
            {buyerTypes.map((buyerType) => (
              <td key={buyerType.id} className="px-3 py-2 text-right font-bold text-slate-950">
                {formatMoney(results[buyerType.id].totalRebates)}
              </td>
            ))}
          </tr>
          <tr className="bg-emerald-50">
            <td className="px-3 py-3 font-bold text-emerald-950">Net to Buyer Price</td>
            {buyerTypes.map((buyerType) => (
              <td key={buyerType.id} className="px-3 py-3 text-right font-bold text-emerald-950">
                {formatMoney(results[buyerType.id].netBuyerPrice)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
        );
      })}
    </div>
  );
}

function RemarksWithLinks({ text }) {
  if (/<[a-z][\s\S]*>/i.test(String(text))) {
    return <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(text) }} />;
  }

  const parts = String(text).split(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi);

  return parts.map((part, index) => {
    if (!/^(https?:\/\/|www\.)/i.test(part)) return part;

    const match = part.match(/^(.*?)([),.;!?]*)$/);
    const url = match?.[1] || part;
    const trailingPunctuation = match?.[2] || '';
    const href = /^www\./i.test(url) ? `https://${url}` : url;

    return (
      <span key={`${url}-${index}`}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-600"
        >
          {url}
        </a>
        {trailingPunctuation}
      </span>
    );
  });
}

export function PropertyDetailsDialog({ property, onClose }) {
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

          {property.remarks?.trim() && (
            <section className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
              <h3 className="text-lg font-bold text-slate-950">Notes</h3>
              <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                <RemarksWithLinks text={property.remarks} />
              </div>
            </section>
          )}

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

