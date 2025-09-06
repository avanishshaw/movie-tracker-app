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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Collection</h1>
            <p className="text-gray-600">Manage your movies and TV shows</p>
          </div>
          <button 
            onClick={handleOpenCreateModal} 
            className="btn-base flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-4 sm:mt-0 px-6 py-3 font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Entry
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
          <div className="text-center py-20">
            <div className="card p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No entries found</h2>
              <p className="text-gray-600 mb-6">Get started by adding your first movie or TV show to your collection!</p>
              <button 
                onClick={handleOpenCreateModal} 
                className="btn-base bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 px-6 py-3 font-semibold"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Entry
              </button>
            </div>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={mediaEntries.length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading more entries...
                </div>
              </div>
            }
          >
            <div className="card rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-100">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Media
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Director
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-50">
                    {mediaEntries.map((entry, index) => (
                      <tr 
                        key={entry._id} 
                        className="hover:bg-gray-50 transition-colors duration-200 animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                                <span className="text-lg">
                                  {entry.type === 'Movie' ? '🎬' : '📺'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {entry.title || 'Untitled'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {entry.duration || 'Unknown Duration'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {entry.type || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {entry.director || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.releaseYear || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {entry.location || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                            entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {user?.role === 'admin' && entry.status === 'pending' ? (
                              <>
                                <button 
                                  onClick={() => approveMutation.mutate(entry._id)} 
                                  className="btn-base bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 text-xs"
                                  title="Approve"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Approve
                                </button>
                                <button 
                                  onClick={() => rejectMutation.mutate(entry._id)} 
                                  className="btn-base bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 text-xs"
                                  title="Reject"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Reject
                                </button>
                              </>
                            ) : (
                              (user?.role === 'admin' || user?.id === entry.createdBy?._id) && (
                                <>
                                  <button 
                                    onClick={() => handleOpenEditModal(entry)} 
                                    className="btn-base rounded-full flex items-center justify-center bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 text-xs"
                                    title="Edit"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(entry._id)} 
                                    className="btn-base bg-red-100 rounded-full flex items-center justify-center text-red-700 hover:bg-red-200 px-3 py-1 text-xs"
                                    title="Delete"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </button>
                                </>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;