import { useEffect, useState } from 'react';
import {
  createProperty,
  createUser,
  deleteUser,
  getProperty,
  getProperties,
  getUsers,
  permanentlyDeleteProperty,
  updateProperty,
  updatePropertyArchive,
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
  const [listingMeta, setListingMeta] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 1, counts: { active: 0, archived: 0 } });
  const [listingPage, setListingPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [userRecords, setUserRecords] = useState([]);
  const [dataError, setDataError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState(() => getPageFromPath(window.location.pathname));
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    status: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({ search: '', location: '', status: '' });

  const formatProperty = (property) => ({
    ...property,
    isArchived: Boolean(property.isArchived),
    price: `RM ${Number(property.price).toLocaleString('en-MY')}`,
  });

  const loadProperties = async (
    authToken = token,
    query = { ...appliedFilters, page: listingPage, archived: showArchived },
  ) => {
    try {
      setDataError('');
      setIsLoadingProperties(true);
      const propertyData = await getProperties(authToken, query);
      setPropertyRecords(propertyData.items.map(formatProperty));
      setListingMeta(propertyData);
      if (propertyData.page !== listingPage) setListingPage(propertyData.page);
    } catch (requestError) {
      setDataError(requestError.message);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  useEffect(() => {
    loadProperties(token, { ...appliedFilters, page: listingPage, archived: showArchived });
  }, [token, currentUser.role, appliedFilters, listingPage, showArchived]);

  useEffect(() => {
    if (currentUser.role !== 'admin') {
      setUserRecords([]);
      return;
    }
    getUsers(token).then(setUserRecords).catch((error) => setDataError(error.message));
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

  const handleFilterChange = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    const emptyFilters = { search: '', location: '', status: '' };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setListingPage(1);
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setListingPage(1);
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
    setShowArchived(false);
    setListingPage(1);
    await loadProperties(token, { ...appliedFilters, page: 1, archived: false });
    return result;
  };

  const handleSaveUser = async (user) => {
    await createUser(token, user);
    setUserRecords(await getUsers(token));
  };

  const handleDeleteUser = async (userId) => {
    await deleteUser(token, userId);
    setUserRecords(await getUsers(token));
  };

  const handleUpdateProperty = async (propertyId, property) => {
    const result = await updateProperty(token, propertyId, property);
    await loadProperties();
    return result;
  };

  const handleUpdatePropertyArchive = async (propertyId, archived) => {
    await updatePropertyArchive(token, propertyId, archived);
    await loadProperties();
  };

  const handleDeleteProperty = async (propertyId) => {
    await permanentlyDeleteProperty(token, propertyId);
    await loadProperties();
  };

  const handleLoadProperty = async (propertyId) => formatProperty(await getProperty(token, propertyId));

  const handleArchiveTabChange = (archived) => {
    setShowArchived(archived);
    setListingPage(1);
  };

  const isAdmin = currentUser.role === 'admin';

  const pageProps = {
    isAdmin,
    filters,
    filteredProperties: propertyRecords,
    propertyRecords,
    listingMeta,
    listingPage,
    showArchived,
    isLoadingProperties,
    onFilterChange: handleFilterChange,
    onSearch: applyFilters,
    onClearFilters: clearFilters,
    onDelete: handleDeleteProperty,
    onEdit: handleUpdateProperty,
    onArchive: handleUpdatePropertyArchive,
    onArchiveTabChange: handleArchiveTabChange,
    onPageChange: setListingPage,
    onLoadProperty: handleLoadProperty,
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
