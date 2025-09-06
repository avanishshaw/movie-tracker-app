// src/pages/DashboardPage.jsx
import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedia, createMedia, updateMedia, deleteMedia, approveMedia, rejectMedia } from '../services/mediaService';
import FilterBar from '../components/FilterBar';
import InfiniteScroll from 'react-infinite-scroll-component';
import Modal from '../components/Modal';
import MediaForm from '../components/MediaForm';
import useAuthStore from '../store/authStore';
import { useEffect } from 'react';

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    industry: '',
  });


  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['mediaEntries'],
    queryFn: ({ pageParam }) => getMedia({ pageParam }),
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
    onError: (error) => {
      console.error("Error creating entry:", error.response);
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
      console.error("Error updating entry:", error.response);
      const message = error.response?.data?.message || 'Failed to update entry. Check console for details.';
      alert(message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaEntries'] });
    },
    onError: (error) => {
      console.error("Error deleting entry:", error.response);
      const message = error.response?.data?.message || 'Failed to delete entry. Check console for details.';
      alert(message);
    }
  });

  const approveMutation = useMutation({
    mutationFn: approveMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaEntries'] });
    },
    onError: (error) => {
      console.error("Error approving entry:", error.response);
      const message = error.response?.data?.message || 'Failed to approve entry. Check console for details.';
      alert(message);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaEntries'] });
    },
    onError: (error) => {
      console.error("Error rejecting entry:", error.response);
      const message = error.response?.data?.message || 'Failed to reject entry. Check console for details.';
      alert(message);
    }
  });

  const handleFormSubmit = (mediaData) => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry._id, mediaData });
    } else {
      createMutation.mutate(mediaData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
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

  const allMediaEntries = data?.pages.flatMap(page => page.data) ?? [];
  
  // Client-side filtering
  const mediaEntries = allMediaEntries.filter(entry => {
    const matchesSearch = !filters.search || 
      entry.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.director?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = !filters.type || entry.type === filters.type;
    
    const matchesIndustry = !filters.industry || entry.location === filters.industry;
    
    return matchesSearch && matchesType && matchesIndustry;
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">An error occurred while fetching data. Please check the console.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button onClick={handleOpenCreateModal} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          + Add New Entry
        </button>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} allMediaEntries={allMediaEntries} />

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
          <table className="min-w-full bg-white border border-gray-200 table-fixed">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-2 px-4 text-left w-1/4">Title</th>
                <th className="py-2 px-4 text-left w-1/6">Type</th>
                <th className="py-2 px-4 text-left w-1/4">Director</th>
                <th className="py-2 px-4 text-left w-1/12">Year</th>
                <th className="py-2 px-4 text-left w-1/6">Industry</th>
                <th className="py-2 px-4 text-left w-1/6">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mediaEntries.map((entry) => (
                <tr key={entry._id} className="border-b hover:bg-gray-100">
                  <td className="py-2 px-4 truncate">{entry.title || '-'}</td>
                  <td className="py-2 px-4">{entry.type || '-'}</td>
                  <td className="py-2 px-4 truncate">{entry.director || '-'}</td>
                  <td className="py-2 px-4">{entry.releaseYear || '-'}</td>
                  <td className="py-2 px-4">{entry.location || '-'}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${entry.status === 'approved' ? 'bg-green-200 text-green-800' :
                        entry.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                      }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    {user?.role === 'admin' && entry.status === 'pending' ? (
                      <>
                        <button onClick={() => approveMutation.mutate(entry._id)} className="text-sm text-green-600 hover:underline">Approve</button>
                        <button onClick={() => rejectMutation.mutate(entry._id)} className="text-sm text-red-600 hover:underline">Reject</button>
                      </>
                    ) : (
                      (user?.role === 'admin' || user?.id === entry.createdBy?._id) && (
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