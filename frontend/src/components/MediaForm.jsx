// src/components/MediaForm.jsx
import { useState } from 'react';
import { z } from 'zod';

// Zod schema for validation
const mediaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(['Movie', 'TV Show']),
  director: z.string().min(1, "Director is required"),
  releaseYear: z.coerce.number().min(1888, "Invalid year"),
  // Add other fields as needed
});

const MediaForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    type: initialData.type || 'Movie',
    director: initialData.director || '',
    releaseYear: initialData.releaseYear || '',
    // ... other fields
  });
  const [poster, setPoster] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setPoster(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate with Zod
    const result = mediaSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    
    // Create FormData to send to backend
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (poster) {
      data.append('poster', poster);
    }
    
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium">Title</label>
        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>}
      </div>
      {/* Other fields like Director, Year, etc. go here... */}

      {/* File Input */}
      <div>
          <label htmlFor="poster" className="block text-sm font-medium">Poster Image</label>
          <input type="file" name="poster" id="poster" onChange={handleFileChange} className="mt-1 block w-full text-sm" />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
      </div>
    </form>
  );
};

export default MediaForm;