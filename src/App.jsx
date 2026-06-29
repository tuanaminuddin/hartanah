import { useEffect, useState } from 'react';
import {
  createProperty,
  createUser,
  deleteUser,
  getProperties,
  getUsers,
  softDeleteProperty,
  updateProperty,
  updatePropertyKiv,
} from './api.js';
import {
  AdminLoginDialog,
  Footer,
  menuItems,
  publicUser,
  TopNav,
} from './components/shared.jsx';
import AddPropertyPage from './pages/AddPropertyPage.jsx';
import AgentsPage from './pages/AgentsPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MonthlyInstallmentPage from './pages/MonthlyInstallmentPage.jsx';
import PropertyListingPage from './pages/PropertyListingPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { getPageFromPath, getPagePath } from './routes.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState(publicUser);
  const [token, setToken] = useState('');
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [propertyRecords, setPropertyRecords] = useState([]);
  const [userRecords, setUserRecords] = useState([]);
  const [dataError, setDataError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState(() => getPageFromPath(window.location.pathname));
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    status: '',
  });

  const loadData = async (authToken = token, userRole = currentUser.role) => {
    try {
      setDataError('');
      const [propertyData, userData] = await Promise.all([
        getProperties(authToken),
        userRole === 'admin' ? getUsers(authToken) : Promise.resolve([]),
      ]);
      setPropertyRecords(propertyData.map((property) => ({
        ...property,
        isKiv: Boolean(property.isKiv),
        price: `RM ${Number(property.price).toLocaleString('en-MY')}`,
      })));
      setUserRecords(userData);
    } catch (requestError) {
      setDataError(requestError.message);
    }
  };

  useEffect(() => {
    loadData(token, currentUser.role);
  }, [token, currentUser.role]);

  useEffect(() => {
    const syncPageWithUrl = () => {
      const pageId = getPageFromPath(window.location.pathname);
      const targetPage = menuItems.find((item) => item.id === pageId);

      if (currentUser.role === 'public' && pageId !== 'dashboard') {
        window.history.replaceState({}, '', getPagePath('dashboard'));
        setActivePage('dashboard');
        return;
      }

      if (targetPage?.adminOnly && currentUser.role !== 'admin') {
        window.history.replaceState({}, '', getPagePath('dashboard'));
        setActivePage('dashboard');
        return;
      }

      if (window.location.pathname !== getPagePath(pageId)) {
        window.history.replaceState({}, '', getPagePath(pageId));
      }
      setActivePage(pageId);
    };

    window.addEventListener('popstate', syncPageWithUrl);
    syncPageWithUrl();

    return () => window.removeEventListener('popstate', syncPageWithUrl);
  }, [currentUser.role]);

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
    if (currentUser?.role === 'public' && pageId !== 'dashboard') {
      window.history.pushState({}, '', getPagePath('dashboard'));
      setActivePage('dashboard');
      setIsSidebarOpen(false);
      return;
    }

    if (targetPage?.adminOnly && currentUser?.role !== 'admin') {
      window.history.pushState({}, '', getPagePath('dashboard'));
      setActivePage('dashboard');
      setIsSidebarOpen(false);
      return;
    }

    if (window.location.pathname !== getPagePath(pageId)) {
      window.history.pushState({}, '', getPagePath(pageId));
    }
    setActivePage(pageId);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(publicUser);
    setToken('');
    window.history.pushState({}, '', getPagePath('dashboard'));
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

  const handleSaveUser = async (user) => {
    await createUser(token, user);
    await loadData();
  };

  const handleDeleteUser = async (userId) => {
    await deleteUser(token, userId);
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
    agents: (
      <AgentsPage
        users={userRecords}
        currentUserId={currentUser.id}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
      />
    ),
    'monthly-installment': <MonthlyInstallmentPage />,
    settings: <SettingsPage isAdmin={isAdmin} />,
  };

  return (
    <div className={`brand-shell flex min-h-screen flex-col bg-slate-50 ${activePage === 'dashboard' ? 'dashboard-shell' : ''}`}>
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
      <main className={activePage === 'dashboard' ? 'w-full' : 'mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8'}>
        {dataError && currentUser.role !== 'public' && (
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
