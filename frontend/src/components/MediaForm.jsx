// src/components/MediaForm.jsx
import { useState, useEffect } from 'react';
import { z } from 'zod';

// REVERTED: Zod schema now validates 'location'
const mediaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(['Movie', 'TV Show']),
  director: z.string().min(1, "Director is required"),
  budget: z.coerce.number().positive("Budget must be a positive number"),
  location: z.string().min(1, "Location is required"),
  duration: z.string().min(1, "Duration is required"),
  releaseYear: z.coerce.number().int().min(1888, "Year must be after 1888").max(new Date().getFullYear() + 5),
});

const MediaForm = ({ onSubmit, onCancel, initialData }) => {
  // REVERTED: state now uses 'location'
  const [formData, setFormData] = useState({
    title: '', type: 'Movie', director: '', budget: '', location: '', duration: '', releaseYear: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '', type: initialData.type || 'Movie',
        director: initialData.director || '', budget: initialData.budget || '',
        location: initialData.location || '', // REVERTED
        duration: initialData.duration || '', releaseYear: initialData.releaseYear || '',
      });
    } else {
      setFormData({
        title: '', type: 'Movie', director: '', budget: '', location: '', duration: '', releaseYear: '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const result = mediaSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }
    
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input 
            type="text" 
            name="title" 
            id="title" 
            value={formData.title} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus-ring transition-colors duration-200"
            placeholder="Enter movie or TV show title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Type *
          </label>
          <select 
            name="type" 
            id="type" 
            value={formData.type} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus-ring transition-colors duration-200"
          >
            <option value="Movie">🎬 Movie</option>
            <option value="TV Show">📺 TV Show</option>
          </select>
          {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type[0]}</p>}
        </div>

        {/* Director */}
        <div>
          <label htmlFor="director" className="block text-sm font-medium text-gray-700 mb-2">
            Director *
          </label>
          <input 
            type="text" 
            name="director" 
            id="director" 
            value={formData.director} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus-ring transition-colors duration-200"
            placeholder="Enter director name"
          />
          {errors.director && <p className="text-red-500 text-sm mt-1">{errors.director[0]}</p>}
        </div>
        
        {/* Budget */}
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
            Budget ($) *
          </label>
          <input 
            type="number" 
            name="budget" 
            id="budget" 
            value={formData.budget} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus-ring transition-colors duration-200"
            placeholder="Enter budget amount"
          />
          {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget[0]}</p>}
        </div>

        {/* Release Year */}
        <div>
          <label htmlFor="releaseYear" className="block text-sm font-medium text-gray-700 mb-2">
            Release Year *
          </label>
          <input 
            type="number" 
            name="releaseYear" 
            id="releaseYear" 
            value={formData.releaseYear} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus-ring transition-colors duration-200"
            placeholder="Enter release year"
          />
          {errors.releaseYear && <p className="text-red-500 text-sm mt-1">{errors.releaseYear[0]}</p>}
        </div>
        
        {/* Industry */}
        <div className="md:col-span-2">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Industry *
          </label>
          <input 
            type="text" 
            name="location" 
            id="location" 
            value={formData.location} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus-ring transition-colors duration-200"
            placeholder="Enter industry (e.g., Hollywood, Bollywood, etc.)"
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location[0]}</p>}
        </div>
        
        {/* Duration */}
        <div className="md:col-span-2">
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration *
          </label>
          <input 
            type="text" 
            name="duration" 
            id="duration" 
            value={formData.duration} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus-ring transition-colors duration-200"
            placeholder="e.g., '150 min' or '3 Seasons'"
          />
          {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration[0]}</p>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn-base border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn-base bg-blue-600 text-white hover:bg-blue-700"
        >
          {initialData ? 'Update Entry' : 'Create Entry'}
        </button>
      </div>
    </form>
  );
};

export default MediaForm;