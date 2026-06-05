const Note = require("../model/notes.model.js");

const createNote = async (req, res) => {
  try {
    const { title, content, category, isPinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required", data: null });
    }
    const note = await Note.create({ title, content, category, isPinned });
    res.status(201).json({ success: true, message: "Note created successfully", data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const createBulkNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({ success: false, message: "notes array is required and cannot be empty", data: null });
    }
    const createdNotes = await Note.insertMany(notes);
    res.status(201).json({ success: true, message: `${createdNotes.length} notes created successfully`, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find();
    res.status(200).json({ success: true, message: "Notes fetched successfully", count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid note ID", data: null });
    }
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found", data: null });
    }
    res.status(200).json({ success: true, message: "Note fetched successfully", data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const replaceNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid note ID", data: null });
    }
    const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true, overwrite: true, runValidators: true });
    if (!updatedNote) {
      return res.status(404).json({ success: false, message: "Note not found", data: null });
    }
    res.status(200).json({ success: true, message: "Note replaced successfully", data: updatedNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid note ID", data: null });
    }
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "No fields provided to update", data: null });
    }
    const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedNote) {
      return res.status(404).json({ success: false, message: "Note not found", data: null });
    }
    res.status(200).json({ success: true, message: "Note updated successfully", data: updatedNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid note ID", data: null });
    }
    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) {
      return res.status(404).json({ success: false, message: "Note not found", data: null });
    }
    res.status(200).json({ success: true, message: "Note deleted successfully", data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const deleteBulkNotes = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty", data: null });
    }
    const result = await Note.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, message: `${result.deletedCount} notes deleted successfully`, data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const searchByTitle = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query 'q' is required", data: null });
    }
    const notes = await Note.find({ title: { $regex: q, $options: "i" } });
    res.status(200).json({ success: true, message: `Search results for: ${q}`, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const searchByContent = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query 'q' is required", data: null });
    }
    const notes = await Note.find({ content: { $regex: q, $options: "i" } });
    res.status(200).json({ success: true, message: `Content search results for: ${q}`, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query 'q' is required", data: null });
    }
    const notes = await Note.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } }
      ]
    });
    res.status(200).json({ success: true, message: `Search results for: ${q}`, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const filterAndSort = async (req, res) => {
  try {
    const { category, isPinned, sortBy = "createdAt", order = "desc" } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isPinned !== undefined) filter.isPinned = isPinned === "true";
    
    const sortOrder = order === "asc" ? 1 : -1;
    const notes = await Note.find(filter).sort({ [sortBy]: sortOrder });
    res.status(200).json({ success: true, message: "Notes fetched successfully", count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const filterAndPaginate = async (req, res) => {
  try {
    const { category, isPinned, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isPinned !== undefined) filter.isPinned = isPinned === "true";
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const total = await Note.countDocuments(filter);
    const notes = await Note.find(filter).skip(skip).limit(limitNum);
    
    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const sortAndPaginate = async (req, res) => {
  try {
    const { sortBy = "createdAt", order = "desc", page = 1, limit = 10 } = req.query;
    
    const sortOrder = order === "asc" ? 1 : -1;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const total = await Note.countDocuments();
    const notes = await Note.find().sort({ [sortBy]: sortOrder }).skip(skip).limit(limitNum);
    
    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const searchAndFilter = async (req, res) => {
  try {
    const { q, category, isPinned } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query 'q' is required", data: null });
    }
    const filter = {};
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } }
    ];
    if (category) filter.category = category;
    if (isPinned !== undefined) filter.isPinned = isPinned === "true";
    
    const notes = await Note.find(filter);
    res.status(200).json({ success: true, message: `Search results for: ${q}`, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = {
  createNote,
  createBulkNotes,
  getAllNotes,
  getNoteById,
  replaceNote,
  updateNote,
  deleteNote,
  deleteBulkNotes,
  searchByTitle,
  searchByContent,
  searchAll,
  filterAndSort,
  filterAndPaginate,
  sortAndPaginate,
  searchAndFilter
};