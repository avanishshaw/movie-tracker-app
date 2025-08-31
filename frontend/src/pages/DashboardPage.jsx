// src/pages/DashboardPage.jsx
import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedia, createMedia } from '../services/mediaService';
import InfiniteScroll from 'react-infinite-scroll-component';
import Modal from '../components/Modal';
import MediaForm from '../components/MediaForm';
import useAuthStore from '../store/authStore';

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // ... (useInfiniteQuery hook remains the same)

  // Mutation for creating a new entry
  const createMutation = useMutation({
    mutationFn: createMedia,
    onSuccess: () => {
      queryClient.invalidateQueries(['mediaEntries']); // Refetch data
      setIsModalOpen(false); // Close modal
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create entry');
    }
  });

  const handleFormSubmit = (formData) => {
    // Here you would check if we are editing or creating
    createMutation.mutate(formData);
  };
  
  const mediaEntries = data?.pages.flatMap(page => page.data) ?? [];
  // ... (loading/error states remain the same)

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          + Add New Entry
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Media Entry">
        <MediaForm
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <InfiniteScroll /* ... (InfiniteScroll component remains the same) */ >
        <table /* ... (table structure remains the same) */ >
          {/* ... (thead remains the same) */ }
          <tbody>
            {mediaEntries.map((entry) => (
              <tr key={entry._id} /* ... */>
                {/* ... (tds for title, type, etc.) */ }
                <td className="py-2 px-4">
                    {/* Conditional Edit/Delete buttons */}
                    {(user?.role === 'admin' || user?.id === entry.createdBy._id) && (
                        <button className="text-sm text-blue-600 hover:underline">Edit</button>
                        // Delete button will go here
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
      {/* ... */}
    </div>
  );
};

export default DashboardPage;