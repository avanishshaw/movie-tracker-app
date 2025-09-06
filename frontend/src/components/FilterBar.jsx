// src/components/FilterBar.jsx
import { useState, useEffect } from 'react';

const FilterBar = ({ filters, setFilters, allMediaEntries = [] }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      industry: '',
    });
  };

  // Get unique industry/location values from the data
  const industryOptions = [...new Set(allMediaEntries.map(entry => entry.location).filter(Boolean))].sort();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex flex-col md:flex-row gap-4 items-center">
      {/* Search Input */}
      <input
        type="text"
        name="search"
        value={filters.search}
        onChange={handleInputChange}
        placeholder="Search by title or director..."
        className="w-full md:w-1/3 border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      />
      {/* Type Filter */}
      <select
        name="type"
        value={filters.type}
        onChange={handleInputChange}
        className="w-full md:w-auto border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">All Types</option>
        <option value="Movie">Movie</option>
        <option value="TV Show">TV Show</option>
      </select>
      {/* Industry Filter */}
      <select
        name="industry"
        value={filters.industry}
        onChange={handleInputChange}
        className="w-full md:w-auto border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">All Industries</option>
        {industryOptions.map(industry => (
          <option key={industry} value={industry}>{industry}</option>
        ))}
      </select>
      {/* Clear Filters Button */}
      <button
        type="button"
        onClick={handleClearFilters}
        className="w-full md:w-auto px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default FilterBar;