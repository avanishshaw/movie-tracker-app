import MediaEntry from '../models/mediaEntry.model.js';

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const createMedia = async (mediaData, userId) => { // UPDATED: Removed 'file' parameter
  const newMediaData = {
    ...mediaData,
    createdBy: userId,
    status: 'pending',
  };
  // All file upload logic is removed.

  const newMedia = new MediaEntry(newMediaData);
  await newMedia.save();
  return newMedia;
};

const getAllMedia = async (user) => {
  let query = { isDeleted: false };
  if (user.role !== 'admin') {
    query.$or = [{ status: 'approved' }, { createdBy: user._id }];
  }
  return MediaEntry.find(query).populate('createdBy', 'name').sort({ createdAt: -1 });
};

const updateMedia = async (mediaId, updateData, user) => { // UPDATED: Removed 'file' parameter
  const media = await MediaEntry.findById(mediaId);
  if (!media || media.isDeleted) throw new ApiError(404, 'Media entry not found');

  if (media.createdBy.toString() !== user.id && user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to update this entry');
  }

  // All file upload logic is removed.
  Object.assign(media, updateData);
  await media.save();
  return media;
};

const deleteMedia = async (mediaId, user) => {
    const media = await MediaEntry.findById(mediaId);
    if (!media || media.isDeleted) throw new ApiError(404, 'Media entry not found');
    if (media.createdBy.toString() !== user.id && user.role !== 'admin') {
        throw new ApiError(403, 'You are not authorized to delete this entry');
    }
    media.isDeleted = true;
    media.deletedAt = new Date();
    await media.save();
    return { message: 'Media entry deleted successfully' };
};

const updateMediaStatus = async (mediaId, status) => {
    const media = await MediaEntry.findById(mediaId);
    if (!media || media.isDeleted) throw new ApiError(404, 'Media entry not found');
    media.status = status;
    await media.save();
    return media;
};

const getPendingMedia = async () => {
    return MediaEntry.find({ status: 'pending', isDeleted: false }).populate('createdBy', 'name');
};

export { createMedia, getAllMedia, updateMedia, deleteMedia, updateMediaStatus, getPendingMedia };