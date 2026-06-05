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

module.exports = {
  createNote,
  createBulkNotes,
  getAllNotes,
  getNoteById,
  replaceNote,
  updateNote,
  deleteNote,
  deleteBulkNotes,
  searchByTitle
};