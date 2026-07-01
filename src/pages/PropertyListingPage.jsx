import { useState } from 'react';
import { Archive, FolderOpen } from 'lucide-react';
import {
  EditPropertyDialog,
  Filters,
  PageHeader,
  PropertyCardGrid,
  PropertyDetailsDialog,
  PropertyPagination,
  PropertyViewControls,
  RecentPropertiesTable,
} from '../components/shared.jsx';

export default function PropertyListingPage({
  isAdmin,
  filters,
  filteredProperties,
  propertyRecords,
  listingMeta,
  listingPage,
  showArchived,
  isLoadingProperties,
  onDelete,
  onEdit,
  onArchive,
  onArchiveTabChange,
  onPageChange,
  onLoadProperty,
  onFilterChange,
  onSearch,
  onClearFilters,
}) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [view, setView] = useState(() => localStorage.getItem('property-listing-view') || 'table');
  const locations = [...new Set(propertyRecords.map((property) => property.location))];

  const changeView = (nextView) => {
    setView(nextView);
    localStorage.setItem('property-listing-view', nextView);
  };

  const loadRecord = async (property, mode) => {
    setIsLoadingRecord(true);
    try {
      const fullProperty = await onLoadProperty(property.id);
      if (mode === 'edit') setEditingProperty(fullProperty);
      else setSelectedProperty(fullProperty);
    } catch (error) {
      window.alert(error.message);
    } finally {
      setIsLoadingRecord(false);
    }
  };

  const changeArchiveState = async (property) => {
    const action = property.isArchived ? 'restore' : 'archive';
    if (!window.confirm(`${action === 'archive' ? 'Archive' : 'Restore'} "${property.name}"?`)) return;
    try {
      await onArchive(property.id, !property.isArchived);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const deleteFromCard = async (property) => {
    if (!window.confirm(`Permanently delete "${property.name}"? This cannot be undone.`)) return;
    try {
      await onDelete(property.id);
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Property Listing"
        description="Review, archive and manage Malaysian property records."
      />

      {isAdmin && (
        <div className="mb-4 flex items-center gap-1 border-b border-slate-200">
          <button
            type="button"
            onClick={() => onArchiveTabChange(false)}
            className={`inline-flex h-11 items-center gap-2 border-b-2 px-4 text-sm font-bold transition ${!showArchived ? 'border-emerald-500 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <FolderOpen size={17} />
            Active
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{listingMeta.counts?.active || 0}</span>
          </button>
          <button
            type="button"
            onClick={() => onArchiveTabChange(true)}
            className={`inline-flex h-11 items-center gap-2 border-b-2 px-4 text-sm font-bold transition ${showArchived ? 'border-amber-500 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Archive size={17} />
            Archive
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{listingMeta.counts?.archived || 0}</span>
          </button>
        </div>
      )}

      <Filters
        filters={filters}
        locations={locations}
        onFilterChange={onFilterChange}
        onSearch={onSearch}
        onClearFilters={onClearFilters}
        resultCount={listingMeta.total}
      />

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-slate-600">
          {showArchived ? 'Archived properties' : 'Active properties'}
        </p>
        <PropertyViewControls view={view} onViewChange={changeView} />
      </div>

      <div className={`relative mt-4 min-h-40 transition ${isLoadingProperties ? 'opacity-50' : ''}`} aria-busy={isLoadingProperties}>
        {isLoadingProperties && (
          <div className="absolute inset-x-0 top-10 z-10 text-center text-sm font-bold text-slate-500">Loading properties...</div>
        )}
        {view === 'table' ? (
          <RecentPropertiesTable
            properties={filteredProperties}
            isAdmin={isAdmin}
            limit={0}
            onDelete={showArchived ? onDelete : undefined}
            onEdit={(property) => loadRecord(property, 'edit')}
            onArchive={changeArchiveState}
            onViewDetails={(property) => loadRecord(property, 'details')}
          />
        ) : (
          <PropertyCardGrid
            properties={filteredProperties}
            isAdmin={isAdmin}
            onEdit={(property) => loadRecord(property, 'edit')}
            onArchive={changeArchiveState}
            onDelete={showArchived ? deleteFromCard : undefined}
            onViewDetails={(property) => loadRecord(property, 'details')}
          />
        )}
      </div>

      <PropertyPagination
        page={listingPage}
        totalPages={listingMeta.totalPages}
        total={listingMeta.total}
        pageSize={listingMeta.pageSize}
        onPageChange={onPageChange}
      />

      {isLoadingRecord && <p className="mt-4 text-center text-sm font-bold text-slate-500">Loading property details...</p>}
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
    </>
  );
}
