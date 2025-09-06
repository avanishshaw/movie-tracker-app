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
    <div className="card mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={filters.search}
              onChange={handleInputChange}
              placeholder="Search by title or director..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus-ring transition-colors duration-200"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="w-full lg:w-48">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            name="type"
            id="type"
            value={filters.type}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus-ring transition-colors duration-200"
          >
            <option value="">All Types</option>
            <option value="Movie">🎬 Movie</option>
            <option value="TV Show">📺 TV Show</option>
          </select>
        </div>

        {/* Industry Filter */}
        <div className="w-full lg:w-48">
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <select
            name="industry"
            id="industry"
            value={filters.industry}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus-ring transition-colors duration-200"
          >
            <option value="">All Industries</option>
            {industryOptions.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div>
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn-base flex justify-center items-center bg-red-100 text-red-600 px-6 py-3 rounded-lg hover:bg-red-600 border border-red-600 whitespace-nowrap shadow-sm hover:shadow-md hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="">
              Clear Filters
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default FilterBar;