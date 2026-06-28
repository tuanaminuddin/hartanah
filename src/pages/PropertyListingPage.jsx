import { useState } from 'react';
import {
  EditPropertyDialog,
  Filters,
  PageHeader,
  PropertyCardGrid,
  PropertyDetailsDialog,
  RecentPropertiesTable,
} from '../components/shared.jsx';
export default function PropertyListingPage({ isAdmin, filters, filteredProperties, propertyRecords, onDelete, onEdit, onFilterChange, onClearFilters }) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
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
    </>
  );
}

