import * as mediaService from '../services/media.service.js';
import { mediaEntrySchema, updateMediaEntrySchema } from '../utils/validators.js';

const handleErrors = (error, res) => {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
}

const create = async (req, res) => {
  try {
    const validatedBody = mediaEntrySchema.parse(req.body);
    const newMedia = await mediaService.createMedia(validatedBody, req.user.id);
    res.status(201).json({ success: true, data: newMedia });
  } catch (error) { handleErrors(error, res); }
};

const getAll = async (req, res) => {
  try {
    const result = await mediaService.getAllMedia(req.user, req.query);
    res.status(200).json(result); 
  } catch (error) { handleErrors(error, res); }
};

const update = async (req, res) => {
  try {
    const validatedBody = updateMediaEntrySchema.parse(req.body);
    const updatedMedia = await mediaService.updateMedia(req.params.id, validatedBody, req.user);
    res.status(200).json({ success: true, data: updatedMedia });
  } catch (error) { handleErrors(error, res); }
};

const deleteEntry = async (req, res) => {
    try {
        const result = await mediaService.deleteMedia(req.params.id, req.user);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) { handleErrors(error, res); }
};

const approveMedia = async (req, res) => {
    try {
        const updatedMedia = await mediaService.updateMediaStatus(req.params.id, 'approved');
        res.status(200).json({ success: true, data: updatedMedia });
    } catch (error) { handleErrors(error, res); }
};

const rejectMedia = async (req, res) => {
    try {
        const updatedMedia = await mediaService.updateMediaStatus(req.params.id, 'rejected');
        res.status(200).json({ success: true, data: updatedMedia });
    } catch (error) { handleErrors(error, res); }
};

const getPending = async (req, res) => {
    try {
        const pendingMedia = await mediaService.getPendingMedia();
        res.status(200).json({ success: true, data: pendingMedia });
    } catch (error) { handleErrors(error, res); }
};



export { create, getAll, update, deleteEntry, approveMedia, rejectMedia, getPending };