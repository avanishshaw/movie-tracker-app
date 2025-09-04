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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Title */}
      <div className="md:col-span-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>}
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
        <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
          <option>Movie</option>
          <option>TV Show</option>
        </select>
        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type[0]}</p>}
      </div>

      {/* Director */}
      <div>
        <label htmlFor="director" className="block text-sm font-medium text-gray-700">Director</label>
        <input type="text" name="director" id="director" value={formData.director} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        {errors.director && <p className="text-red-500 text-xs mt-1">{errors.director[0]}</p>}
      </div>
      
      {/* Budget */}
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget ($)</label>
        <input type="number" name="budget" id="budget" value={formData.budget} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget[0]}</p>}
      </div>

      {/* Release Year */}
      <div>
        <label htmlFor="releaseYear" className="block text-sm font-medium text-gray-700">Release Year</label>
        <input type="number" name="releaseYear" id="releaseYear" value={formData.releaseYear} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        {errors.releaseYear && <p className="text-red-500 text-xs mt-1">{errors.releaseYear[0]}</p>}
      </div>
      
      {/* REVERTED: Back to Location text input */}
      <div className="md:col-span-2">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
        <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location[0]}</p>}
      </div>
      
      {/* Duration */}
      <div className="md:col-span-2">
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (e.g., "150 min" or "3 Seasons")</label>
        <input type="text" name="duration" id="duration" value={formData.duration} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration[0]}</p>}
      </div>

      {/* Action Buttons */}
      <div className="md:col-span-2 flex justify-end space-x-4 pt-4 border-t mt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
      </div>
    </form>
  );
};

export default MediaForm;