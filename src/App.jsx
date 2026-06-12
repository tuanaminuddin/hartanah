import { useEffect, useState } from 'react';
import {
  createAgent,
  createProperty,
  getAgents,
  getProperties,
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
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

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
