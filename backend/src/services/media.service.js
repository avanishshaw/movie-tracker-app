import MediaEntry from '../models/mediaEntry.model.js';
import cloudinary from '../config/cloudinary.js';

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder: 'movie-tracker' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const createMedia = async (mediaData, userId, file) => {
  const newMediaData = { ...mediaData, createdBy: userId, status: 'pending' };

  if (file) {
    const uploadResult = await uploadToCloudinary(file.buffer);
    newMediaData.posterUrl = uploadResult.secure_url;
    // Cloudinary can create transformations on the fly. We'll store the base URL.
    // Example for a thumbnail: replace /upload/ with /upload/w_200,h_200,c_fill/
    newMediaData.thumbnailUrl = uploadResult.secure_url.replace('/upload/', '/upload/c_thumb,w_200,g_face/');
  }

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

const updateMedia = async (mediaId, updateData, user) => {
  const media = await MediaEntry.findById(mediaId);
  if (!media || media.isDeleted) throw new ApiError(404, 'Media entry not found');
  if (media.createdBy.toString() !== user.id && user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to update this entry');
  }
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