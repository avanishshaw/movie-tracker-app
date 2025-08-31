// In backend/src/services/media.service.js

// Change the getAllMedia function to this:
const getAllMedia = async (user, queryOptions) => {
  const { page = 1, limit = 10 } = queryOptions;
  const skip = (page - 1) * limit;

  let query = { isDeleted: false };
  if (user.role !== 'admin') {
    query.$or = [{ status: 'approved' }, { createdBy: user._id }];
  }

  const mediaEntries = await MediaEntry.find(query)
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  
  const total = await MediaEntry.countDocuments(query);

  return { data: mediaEntries, page: Number(page), pages: Math.ceil(total / limit) };
};
// Make sure to update the controller to pass req.query to the service.