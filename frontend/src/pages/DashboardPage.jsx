// src/pages/DashboardPage.jsx
import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// UPDATED: import deleteMedia
import { getMedia, createMedia, updateMedia, deleteMedia, approveMedia, rejectMedia } from '../services/mediaService';
import InfiniteScroll from 'react-infinite-scroll-component';
import Modal from '../components/Modal';
import MediaForm from '../components/MediaForm';
import useAuthStore from '../store/authStore';

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['mediaEntries'],
    queryFn: getMedia,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  const createMutation = useMutation({
    mutationFn: createMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaEntries'] });
      handleCloseModal();
    },
    // UPDATED onError handler
    onError: (error) => {
      // Log the detailed error to the browser console
      console.error("Error creating entry:", error.response); 
      
      // Get a more specific message if available, otherwise use the fallback
      const message = error.response?.data?.message || 'Failed to create entry. Check console for details.';
      alert(message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaEntries'] });
      handleCloseModal();
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update entry');
    }
  });

  // NEW: Mutation for deleting an entry
  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaEntries'] });
    },
    onError: (error) => {
        alert(error.response?.data?.message || 'Failed to delete entry');
    }
  });

  // NEW: Mutation for an admin to approve an entry
  const approveMutation = useMutation({
    mutationFn: approveMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaEntries'] });
    },
    onError: (error) => {
        alert(error.response?.data?.message || 'Failed to approve entry');
    }
  });

  // NEW: Mutation for an admin to reject an entry
  const rejectMutation = useMutation({
    mutationFn: rejectMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaEntries'] });
    },
    onError: (error) => {
        alert(error.response?.data?.message || 'Failed to reject entry');
    }
  });

  const handleFormSubmit = (formData) => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry._id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  // NEW: Function to handle the delete confirmation and action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
        deleteMutation.mutate(id);
    }
  };

  const handleOpenEditModal = (entry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };
  
  const handleOpenCreateModal = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const mediaEntries = data?.pages.flatMap(page => page.data) ?? [];

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">An error occurred: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button onClick={handleOpenCreateModal} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          + Add New Entry
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingEntry ? 'Edit Media Entry' : 'Add New Media Entry'}
      >
        <MediaForm
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          initialData={editingEntry}
        />
      </Modal>

      {!isLoading && mediaEntries.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-lg shadow-md mt-4">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Entries Found</h2>
          <p className="text-gray-500 mb-4">Get started by adding your first movie or TV show!</p>
          <button onClick={handleOpenCreateModal} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            + Add New Entry
          </button>
        </div>
      ) : (
        <InfiniteScroll
        dataLength={mediaEntries.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<h4 className="text-center my-4">Loading more...</h4>}
      >
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4 text-left">Title</th>
              <th className="py-2 px-4 text-left">Type</th>
              <th className="py-2 px-4 text-left">Director</th>
              <th className="py-2 px-4 text-left">Year</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mediaEntries.map((entry) => (
              <tr key={entry._id} className="border-b hover:bg-gray-100">
                {/* ... (other <td> cells remain the same) */}
                <td className="py-2 px-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      entry.status === 'approved' ? 'bg-green-200 text-green-800' :
                      entry.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {entry.status}
                    </span>
                </td>
                <td className="py-2 px-4 space-x-2">
                  {/* UPDATED: Actions column with admin approval logic */}
                  {user?.role === 'admin' && entry.status === 'pending' ? (
                    <>
                      <button onClick={() => approveMutation.mutate(entry._id)} className="text-sm text-green-600 hover:underline">Approve</button>
                      <button onClick={() => rejectMutation.mutate(entry._id)} className="text-sm text-red-600 hover:underline">Reject</button>
                    </>
                  ) : (
                    (user?.role === 'admin' || user?.id === entry.createdBy._id) && (
                      <>
                        <button onClick={() => handleOpenEditModal(entry)} className="text-sm text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(entry._id)} className="text-sm text-red-600 hover:underline">Delete</button>
                      </>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
      )}
    </div>
  );
};

export default DashboardPage;