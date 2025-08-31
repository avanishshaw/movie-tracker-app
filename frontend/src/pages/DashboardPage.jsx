// src/pages/DashboardPage.jsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { getMedia } from '../services/mediaService';
import InfiniteScroll from 'react-infinite-scroll-component';

const DashboardPage = () => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['mediaEntries'],
    queryFn: getMedia,
    getNextPageParam: (lastPage) => {
      // If the last page number is less than the total number of pages,
      // return the next page number. Otherwise, return undefined.
      if (lastPage.page < lastPage.pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  // Flatten the pages array into a single array of media entries
  const mediaEntries = data?.pages.flatMap(page => page.data) ?? [];

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">An error occurred: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <InfiniteScroll
        dataLength={mediaEntries.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<h4 className="text-center my-4">Loading more...</h4>}
        endMessage={<p className="text-center my-4"><b>You have seen it all!</b></p>}
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
            {mediaEntries.map((entry, index) => (
              <tr key={entry._id || index} className="border-b hover:bg-gray-100">
                <td className="py-2 px-4">{entry.title}</td>
                <td className="py-2 px-4">{entry.type}</td>
                <td className="py-2 px-4">{entry.director}</td>
                <td className="py-2 px-4">{entry.releaseYear}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    entry.status === 'approved' ? 'bg-green-200 text-green-800' :
                    entry.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {entry.status}
                  </span>
                </td>
                <td className="py-2 px-4">{/* Action buttons will go here */}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
      {isFetchingNextPage && <h4 className="text-center my-4">Loading more...</h4>}
    </div>
  );
};

export default DashboardPage;