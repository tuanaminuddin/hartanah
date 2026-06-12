import { useState } from 'react';
import { Building2, CircleDollarSign, Home, PlusCircle, SlidersHorizontal } from 'lucide-react';
import {
  EditPropertyDialog,
  Filters,
  KivPropertyDialog,
  PageHeader,
  PropertyCardGrid,
  PropertyDetailsDialog,
  RecentPropertiesTable,
  StatCard,
} from '../components/shared.jsx';
export default function DashboardPage({
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
        backgroundImage="/images/ChatGPT Image Jun 12, 2026, 11_53_39 AM.png"
      >
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {liveStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </section>
      </PageHeader>

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

