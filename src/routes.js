export const pagePaths = {
  dashboard: '/dashboard',
  'property-listing': '/property-listing',
  'add-property': '/add-property',
  agents: '/agents',
  'monthly-installment': '/monthly-installment',
  settings: '/settings',
};

export const getPagePath = (pageId) => pagePaths[pageId] || pagePaths.dashboard;

export const getPageFromPath = (pathname) => {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const matchedPage = Object.entries(pagePaths).find(([, path]) => path === normalizedPath);

  return matchedPage?.[0] || 'dashboard';
};
